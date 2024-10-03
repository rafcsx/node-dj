<template>
  <div class="dance-room">
    <h1>Projeto Node DJ</h1>

    <div class="youtube-player" v-if="currentSong">
      <h2>Now Playing: {{ currentSong.title }} by {{ currentSong.artist }}</h2>
      <iframe
        :src="`https://www.youtube.com/embed/${currentSong.link}?autoplay=1`"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
      <div class="vote-controls">
        <button @click="vote('skip')">Skip ({{ currentSong.votes.skip }})</button>
        <button @click="vote('like')">Like ({{ currentSong.votes.like }})</button>
      </div>
      <div v-if="isRoomOwner" class="owner-controls">
        <button @click="skipSong">Skip Song</button>
      </div>
    </div>

    <div class="add-song" v-if="isSearchVisible">
      <input v-model="youtubeSearch" placeholder="Search YouTube" />
      <button class="search-button" @click="searchYouTube">🔍 Search</button>
    </div>

    <div class="search-results" v-if="searchResults.length > 0">
      <h2>Search Results:</h2>
      <div class="results-container">
        <ul class="results-list">
          <li v-for="video in searchResults" :key="video.id.videoId" class="search-item">
            <img :src="video.snippet.thumbnails.default.url" alt="Thumbnail" />
            <div class="video-info">
              <h3>{{ video.snippet.title }}</h3>
              <p>{{ video.snippet.description }}</p>
              <button class="add-to-queue-button" @click="addSong(video.id.videoId)">Add to Queue</button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="music-queue">
      <h2>Music Queue</h2>
      <ul>
        <li v-for="(song, index) in musicQueue" :key="index">
          {{ song.title }} by {{ song.artist }}
          <button @click="voteSong(song, 'like')">👍</button>
          <button @click="voteSong(song, 'skip')">👎</button>
        </li>
      </ul>
    </div>

    <div class="favorites">
      <h2>Your Favorites</h2>
      <ul>
        <li v-for="(song, index) in favorites" :key="index">
          {{ song.title }} by {{ song.artist }}
        </li>
      </ul>
    </div>

    <div class="selection-panel">
      <h2>Select Your Dancer</h2>
      <div class="avatars">
        <div
          class="avatar-thumbnail"
          v-for="(avatar, index) in availableAvatars"
          :key="index"
          @click="selectDancer(avatar)"
          :class="{ selected: selectedDancer === avatar }"
        >
          <img :src="avatar.src" :alt="avatar.name" />
          <p>{{ avatar.name }}</p>
        </div>
      </div>
    </div>

    <div class="dance-floor">
      <h2>Dancers</h2>
      <div class="dance-floor-area">
        <div class="dance-floor-icon">
          <i class="fas fa-square"></i> <!-- Pista de dança -->
        </div>
        <div class="dance-floor-icon">
          <i class="fas fa-lightbulb"></i> <!-- Lâmpada de balada -->
        </div>
        <div class="dance-floor-icon">
          <i class="fas fa-table"></i> <!-- Mesas -->
        </div>
        <div class="dance-floor-icon">
          <i class="fas fa-volume-up"></i> <!-- Caixas de som -->
        </div>

        <div v-if="selectedDancer" class="avatar">
          <img :src="selectedDancer.src" :alt="`${selectedDancer.name}'s Avatar`" />
        </div>
      </div>
    </div>

    <!-- Chat Section -->
    <div class="chat-room">
      <h2>Chat Room</h2>
      <input v-model="chatUser" placeholder="Enter your name" />
      <div class="chat-messages">
        <div v-for="(message, index) in chatMessages" :key="index">
          <strong>{{ message.user }}:</strong> {{ message.text }}
        </div>
      </div>
      <input v-model="chatInput" @keyup.enter="sendMessage" placeholder="Type your message..." />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      youtubeSearch: '',
      searchResults: [],
      currentSong: null,
      musicQueue: [],
      favorites: [],
      availableAvatars: [
        { name: 'Character 1', src: 'https://cdn.myanimelist.net/images/characters/15/308148.jpg' },
        { name: 'Character 2', src: 'https://cdn.myanimelist.net/s/common/userimages/a536cf6e-2fa5-4e9b-9aa6-7240d24f00de_225w?s=f5bbf99400c776ff6048bc91c2635811' },
        { name: 'Character 3', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz74HowORgctJcX9zUaFx3CtafnomjDK1_kA&s' },
        { name: 'Character 4', src: 'https://i.pinimg.com/236x/60/d5/18/60d518099d93103d040490d1167c56d3.jpg' },
      ],
      selectedDancer: null,
      isRoomOwner: false,
      isSearchVisible: true,
      chatMessages: [],
      chatInput: '',
      chatUser: '', // Novo campo para nome do usuário
    };
  },
  methods: {
    async searchYouTube() {
      const apiKey = 'AIzaSyCmAhVibHjcdcarHQtkkpwfFhCTGsBjtWI'; // Adicione sua chave de API do YouTube aqui
      if (!apiKey) {
        alert("Please enter your YouTube API key!");
        return;
      }
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${this.youtubeSearch}&key=${apiKey}`
      );
      const data = await response.json();
      this.searchResults = data.items;
    },
    addSong(videoId) {
      const newSong = {
        title: 'Unknown Title',
        artist: 'Unknown Artist',
        link: videoId,
        votes: {
          skip: 0,
          like: 0,
        },
      };
      this.musicQueue.push(newSong);
      this.youtubeSearch = '';
      if (!this.currentSong) {
        this.playNextSong();
      }
    },
    playNextSong() {
      if (this.musicQueue.length > 0) {
        this.currentSong = this.musicQueue.shift();
      } else {
        this.currentSong = null;
        this.isSearchVisible = true;
      }
    },
    skipSong() {
      this.playNextSong();
      if (!this.currentSong) {
        this.isSearchVisible = true;
      }
    },
    vote(voteType) {
      if (this.currentSong) {
        this.currentSong.votes[voteType]++;
        const skipVotesNeeded = Math.floor(this.users.length / 2);
        if (this.currentSong.votes.skip > skipVotesNeeded) {
          this.playNextSong();
        }
      }
    },
    voteSong(song, voteType) {
      song.votes[voteType]++;
      const skipVotesNeeded = Math.floor(this.users.length / 2);
      if (voteType === 'skip' && song.votes.skip > skipVotesNeeded) {
        const index = this.musicQueue.indexOf(song);
        if (index > -1) {
          this.musicQueue.splice(index, 1);
          this.playNextSong();
        }
      }
    },
    selectDancer(avatar) {
      this.selectedDancer = avatar;
    },
    sendMessage() {
      if (this.chatInput.trim()) {
        this.chatMessages.push({ user: this.chatUser || 'User', text: this.chatInput });
        this.chatInput = ''; // Limpa o input após enviar
      }
    },
  },
};
</script>

<style scoped>
.dance-room {
  text-align: center;
  background-color: #16213e; /* Fundo preto */
  color: #ffffff; /* Cor do texto branca para contraste */
  padding: 20px;
}

.youtube-player {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 20px;
  margin: 20px auto;
}

.youtube-player iframe {
  width: 80%;
  height: 400px;
  border: none;
}

.vote-controls {
  margin-top: 10px;
}

.add-song {
  margin-top: 20px;
}

.search-results {
  overflow-y: auto; /* Adiciona rolagem vertical */
  max-height: 300px; /* Altura máxima da área de resultados */
}

.results-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.results-list {
  list-style-type: none;
  padding: 0;
}

.search-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.search-item img {
  width: 80px;
  height: 80px;
  border-radius: 5px; /* Esquinas arredondadas */
  margin-right: 10px; /* Espaçamento à direita da imagem */
}

.add-to-queue-button {
  background-color: #353535; /* Cor do botão */
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-queue-button:hover {
  background-color: #ccc; /* Cor do botão ao passar o mouse */
}

.music-queue {
  background-color: rgba(0, 0, 0, 0.8);
  padding: 15px;
  margin-top: 20px;
}

.selection-panel {
  margin-top: 20px;
}

.avatars {
  display: flex;
  justify-content: center;
  flex-wrap: wrap; /* Permite que os avatares quebrem em várias linhas */
}

.avatar-thumbnail {
  cursor: pointer;
  margin: 10px;
  text-align: center;
  transition: transform 0.3s; /* Transição suave ao ser selecionado */
}

.avatar-thumbnail.selected {
  transform: scale(0.8); /* Reduz o tamanho do avatar selecionado */
}

.avatar-thumbnail img {
  width: 60px; /* Tamanho do avatar */
  height: 60px; /* Tamanho do avatar */
  border-radius: 50%; /* Formato circular */
}

.dance-floor {
  margin-top: 20px;
}

.dance-floor-area {
  display: flex;
  justify-content: center;
  margin: 20px;
}

.dance-floor-icon {
  margin: 10px;
  font-size: 24px; /* Tamanho dos ícones */
}

.chat-room {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
}

.chat-messages {
  height: 200px;
  overflow-y: auto; /* Adiciona rolagem vertical */
  margin-bottom: 10px; /* Espaçamento abaixo da área de mensagens */
}
</style>
