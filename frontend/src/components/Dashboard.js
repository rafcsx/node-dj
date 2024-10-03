// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const result = await axios.get('http://localhost:8080/api/rooms');
            setRooms(result.data);
        };

        fetchRooms();
    }, []);

    return (
        <div>
            <h1>Salas de Dança</h1>
            <ul>
                {rooms.map(room => (
                    <li key={room._id}>{room.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
