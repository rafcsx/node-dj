<template>
        <!-- Barra de Pesquisa do YouTube -->
        <div class="youtube-search">
      <input v-model="youtubeSearch" placeholder="Search YouTube" />
      <button class="search-button" @click="searchYouTube">🔍 Search</button>
    </div>
  <div class="dance-room">


    <!-- Menu de Navegação -->
    <div class="navigation-menu">
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#queue">Queue</a></li>
        <li><a href="#favorites">Favorites</a></li>
        <li><a href="#chat">Chat</a></li>
      </ul>
    </div>

    <!-- Área Principal -->
    <div class="main-content">
      <!-- Player do YouTube -->
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

      <!-- Adicionar Música -->
      <div class="add-song" v-if="isSearchVisible">
        <input v-model="youtubeSearch" placeholder="Search YouTube" />
        <button class="search-button" @click="searchYouTube">🔍 Search</button>
      </div>

      <!-- Resultados da Pesquisa -->
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

      <!-- Fila de Música -->
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



      <!-- Seleção de Avatar -->
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

      <!-- Pista de Dança -->
      <div class="dance-floor">
        <h2>Dancers</h2>
        <div class="dance-floor-area">
          <div v-for="(dancer, index) in dancers" :key="index" class="dance-floor-icon">
            <img :src="dancer.src" :alt="dancer.name" />
          </div>
        </div>
      </div>
    </div>

    <!-- Chat -->
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
      chatUser: '',
    };
  },
  methods: {
    async searchYouTube() {
      const apiKey = 'AIzaSyCmAhVibHjcdcarHQtkkpwfFhCTGsBjtWI';
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
        this.chatInput = '';
      }
    },
  },
};
</script>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';

body {
  margin: 0; /* Remove margens do body */
  overflow: hidden; /* Impede barras de rolagem */
}


.dance-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #16213e; /* Cor de fundo padrão */
  background-image: url('@/assets/bg/background.jpg'); /* Caminho para a imagem de fundo */
  background-size: cover; /* A imagem cobre toda a área */
  background-position: center; /* Centraliza a imagem */
  color: #ffffff;
  padding: 20px;
  height: 85vh; /* Para ocupar a altura da tela */
}


.navigation-menu {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 60px; /* Largura do menu de navegação lateral */
  background-color: #0f1b2b;
  display: flex;
  flex-direction: column;
  padding-top: 350px;
}

.navigation-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navigation-menu li {
  margin: 15px 0;
}

.navigation-menu a {
  color: #ffffff;
  text-decoration: none;
  display: block;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.navigation-menu a:hover {
  background-color: #353535; /* Cor ao passar o mouse */
}

.main-content {
  margin-left: 70px; /* Espaço para o menu de navegação */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%; /* Para ocupar toda a altura disponível */
}

.youtube-player {
  width: 100%;
  height: 320px; /* Tamanho do player do YouTube */
}

.add-song {
  width: 100%;
  padding: 10px;
  background-color: #0f1b2b;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-button {
  background-color: #353535; /* Cor do botão de pesquisa */
  color: #ffffff;
  border: none;
  padding: 20px;
  margin-left: 5%;
  border-radius: 4px;
  cursor: pointer;
}

.search-results {
  width: 100%;
  margin-bottom: 20px;
}

.results-container {
  display: flex;
  flex-direction: column;
}

.results-list {
  list-style: none;
  padding: 0;
}

.search-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.search-item img {
  width: 100px; /* Largura da miniatura */
  height: auto;
  margin-right: 10px;
}

.add-to-queue-button {
  background-color: #353535; /* Cor do botão de adicionar à fila */
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.music-queue, .favorites, .selection-panel, .dance-floor {
  width: 100%;
  background-color: #0f1b2b;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.music-queue h2,
.favorites h2,
.selection-panel h2,
.dance-floor h2 {
  margin: 0;
}

.dance-floor-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.dance-floor-icon {
  margin: 5px;
  width: 80px; /* Tamanho dos ícones dos dançarinos */
}

.dance-floor-icon img {
  width: 100%;
}

.avatars {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.avatar-thumbnail {
  cursor: pointer;
  border: 2px solid transparent; /* Borda padrão */
  border-radius: 4px;
  transition: border-color 0.3s;
}

.avatar-thumbnail.selected {
  border-color: #ccc; /* Cor da borda quando selecionado */
}

.avatar-thumbnail img {
  width: 100px; /* Tamanho dos avatares */
}

.chat-room {
  position: fixed; /* Posiciona o chat à direita */
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px; /* Largura do chat */
  background-color: #353535;
  padding: 10px;
  overflow-y: auto; /* Permite rolagem se necessário */
}

.chat-messages {
  height: 60%;
  overflow-y: auto;
  margin-bottom: 10px;
}

.chat-room input {
  width: calc(100% - 20px); /* Tamanho do campo de entrada */
}

.youtube-search {
  width: 1080px; /* Largura da barra de pesquisa */
  height: 50px; /* Altura da barra de pesquisa */
  display: flex; /* Flexbox para alinhamento dos itens */
  align-items: center; /* Centraliza verticalmente */
  background-color: #0f1b2b; /* Fundo da barra de pesquisa */
  border-radius: 4px; /* Bordas arredondadas */
  margin-bottom: 20px; /* Espaçamento abaixo da barra */
  padding: 0 10px; /* Espaçamento lateral */
}

.youtube-search input {
  flex-grow: 1; /* O campo de entrada cresce para preencher o espaço disponível */
  height: 100%; /* Altura do campo de entrada */
  border: none; /* Remove a borda padrão */
  padding: 10px; /* Espaçamento interno */
  border-radius: 4px; /* Bordas arredondadas */
}

.youtube-search .search-button {
  height: 100%; /* Altura do botão */
  background-color: #353535; /* Cor do botão de pesquisa */
  color: #ffffff; /* Cor do texto do botão */
  border: none; /* Remove a borda padrão */
  padding: 10px 20px; /* Espaçamento interno do botão */
  border-radius: 4px; /* Bordas arredondadas */
  cursor: pointer; /* Cursor de ponteiro ao passar sobre o botão */
}
</style>
