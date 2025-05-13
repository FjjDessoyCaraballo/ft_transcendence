// INTERFACES

export interface DashboardUserData {
	id: number;
	username: string;
	password: string;
	ranking_points: number;
	avatar_url: string;
	games_played_pong: number;
	wins_pong: number;
	losses_pong: number;
	games_played_blockbattle: number;
	wins_blockbattle: number;
	losses_blockbattle: number;
	tournaments_played: number;
	tournaments_won: number;
	tournament_points: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
	match_history: MatchData[];
}

export interface PongData {
	id: number;
	match_id: number;
	longest_rally: number;
	avg_rally: number;
	player1_points: number;
	player2_points: number;
}

export interface BBData {
	id: number;
	match_id: number;
	win_method: string; // KO or Coins
	player1_weapon1: string;
	player1_weapon2: string;
	player1_damage_taken: number;
	player1_damage_done: number;
	player1_coins_collected: number;
	player1_shots_fired: number;
	player2_weapon1: string;
	player2_weapon2: string;
	player2_damage_taken: number;
	player2_damage_done: number;
	player2_coins_collected: number;
	player2_shots_fired: number;	
}

export interface MatchData {
	id: number;
	date: Date;
	player1_id: number;
	player1_rank: number;
	player2_id: number;
	player2_rank: number;
	winner_id: number;
	game_duration: number;
	game_type: string; // pong / blockbattle
	created_at: Date;
	game_data: PongData | BBData;
}

// MATCH HISTORY DATA

const panuMatchHistory: MatchData[] = [
    // Pong game - Player 0 wins (5-3)
    {
        id: 1,
        date: new Date("2025-05-01T10:00:00Z"),
        player1_id: 0,
        player1_rank: 1000,
        player2_id: 101,
        player2_rank: 1020,
        winner_id: 0,
        game_duration: 300,
        game_type: "pong",
        created_at: new Date("2025-05-01T10:05:00Z"),
        game_data: {
            id: 1,
            match_id: 1,
            longest_rally: 15,
            avg_rally: 8,
            player1_points: 5,
            player2_points: 3
        }
    },

    // Pong game - Player 0 wins (5-2)
    {
        id: 2,
        date: new Date("2025-05-02T12:00:00Z"),
        player1_id: 102,
        player1_rank: 1040,
        player2_id: 0,
        player2_rank: 1030,
        winner_id: 0,
        game_duration: 320,
        game_type: "pong",
        created_at: new Date("2025-05-02T12:05:00Z"),
        game_data: {
            id: 2,
            match_id: 2,
            longest_rally: 12,
            avg_rally: 7,
            player1_points: 2,
            player2_points: 5
        }
    },

    // Pong game - Player 103 wins (5-4)
    {
        id: 3,
        date: new Date("2025-05-03T15:00:00Z"),
        player1_id: 0,
        player1_rank: 1030,
        player2_id: 103,
        player2_rank: 1010,
        winner_id: 103,
        game_duration: 290,
        game_type: "pong",
        created_at: new Date("2025-05-03T15:05:00Z"),
        game_data: {
            id: 3,
            match_id: 3,
            longest_rally: 18,
            avg_rally: 9,
            player1_points: 4,
            player2_points: 5
        }
    },

    // Pong game - Player 0 wins (5-1)
    {
        id: 4,
        date: new Date("2025-05-04T18:00:00Z"),
        player1_id: 104,
        player1_rank: 1020,
        player2_id: 0,
        player2_rank: 1010,
        winner_id: 0,
        game_duration: 310,
        game_type: "pong",
        created_at: new Date("2025-05-04T18:05:00Z"),
        game_data: {
            id: 4,
            match_id: 4,
            longest_rally: 10,
            avg_rally: 5,
            player1_points: 1,
            player2_points: 5
        }
    },

    // Pong game - Player 105 wins (5-0)
    {
        id: 5,
        date: new Date("2025-05-05T20:00:00Z"),
        player1_id: 0,
        player1_rank: 1040,
        player2_id: 105,
        player2_rank: 1050,
        winner_id: 105,
        game_duration: 305,
        game_type: "pong",
        created_at: new Date("2025-05-05T20:05:00Z"),
        game_data: {
            id: 5,
            match_id: 5,
            longest_rally: 5,
            avg_rally: 3,
            player1_points: 0,
            player2_points: 5
        }
    },

    // Pong game - Player 0 wins (5-2)
    {
        id: 6,
        date: new Date("2025-05-06T21:00:00Z"),
        player1_id: 106,
        player1_rank: 1060,
        player2_id: 0,
        player2_rank: 1020,
        winner_id: 0,
        game_duration: 315,
        game_type: "pong",
        created_at: new Date("2025-05-06T21:05:00Z"),
        game_data: {
            id: 6,
            match_id: 6,
            longest_rally: 14,
            avg_rally: 8,
            player1_points: 2,
            player2_points: 5
        }
    },

    // Blockbattle - Player 0 loses (KO)
    {
        id: 7,
        date: new Date("2025-05-07T11:00:00Z"),
        player1_id: 0,
        player1_rank: 1050,
        player2_id: 201,
        player2_rank: 1070,
        winner_id: 201,
        game_duration: 480,
        game_type: "blockbattle",
        created_at: new Date("2025-05-07T11:10:00Z"),
        game_data: {
            id: 7,
            match_id: 7,
            win_method: "KO",
            player1_weapon1: "laser",
            player1_weapon2: "pistol",
            player1_damage_taken: 100,
            player1_damage_done: 30,
            player1_coins_collected: 3,
            player1_shots_fired: 50,
            player2_weapon1: "shotgun",
            player2_weapon2: "laser",
            player2_damage_taken: 40,
            player2_damage_done: 100,
            player2_coins_collected: 2,
            player2_shots_fired: 60
        }
    },

    // Blockbattle - Player 0 wins (Coins)
    {
        id: 8,
        date: new Date("2025-05-08T13:00:00Z"),
        player1_id: 202,
        player1_rank: 1080,
        player2_id: 0,
        player2_rank: 1030,
        winner_id: 0,
        game_duration: 500,
        game_type: "blockbattle",
        created_at: new Date("2025-05-08T13:10:00Z"),
        game_data: {
            id: 8,
            match_id: 8,
            win_method: "Coins",
            player1_weapon1: "shotgun",
            player1_weapon2: "pistol",
            player1_damage_taken: 40,
            player1_damage_done: 80,
            player1_coins_collected: 4,
            player1_shots_fired: 55,
            player2_weapon1: "laser",
            player2_weapon2: "pistol",
            player2_damage_taken: 20,
            player2_damage_done: 70,
            player2_coins_collected: 5,
            player2_shots_fired: 45
        }
    },

    // Blockbattle - Player 203 wins (KO)
    {
        id: 9,
        date: new Date("2025-05-09T14:00:00Z"),
        player1_id: 0,
        player1_rank: 1060,
        player2_id: 203,
        player2_rank: 1040,
        winner_id: 203,
        game_duration: 470,
        game_type: "blockbattle",
        created_at: new Date("2025-05-09T14:10:00Z"),
        game_data: {
            id: 9,
            match_id: 9,
            win_method: "KO",
            player1_weapon1: "laser",
            player1_weapon2: "shotgun",
            player1_damage_taken: 100,
            player1_damage_done: 50,
            player1_coins_collected: 3,
            player1_shots_fired: 45,
            player2_weapon1: "pistol",
            player2_weapon2: "laser",
            player2_damage_taken: 30,
            player2_damage_done: 100,
            player2_coins_collected: 2,
            player2_shots_fired: 60
        }
    },

    // Blockbattle - Player 0 wins (Coins)
    {
        id: 10,
        date: new Date("2025-05-10T16:00:00Z"),
        player1_id: 204,
        player1_rank: 1030,
        player2_id: 0,
        player2_rank: 1040,
        winner_id: 0,
        game_duration: 450,
        game_type: "blockbattle",
        created_at: new Date("2025-05-10T16:10:00Z"),
        game_data: {
            id: 10,
            match_id: 10,
            win_method: "Coins",
            player1_weapon1: "laser",
            player1_weapon2: "shotgun",
            player1_damage_taken: 60,
            player1_damage_done: 90,
            player1_coins_collected: 4,
            player1_shots_fired: 70,
            player2_weapon1: "pistol",
            player2_weapon2: "laser",
            player2_damage_taken: 50,
            player2_damage_done: 60,
            player2_coins_collected: 5,
            player2_shots_fired: 65
        }
    },

    // Blockbattle - Player 205 wins (KO)
    {
        id: 11,
        date: new Date("2025-05-11T17:00:00Z"),
        player1_id: 0,
        player1_rank: 1070,
        player2_id: 205,
        player2_rank: 1060,
        winner_id: 205,
        game_duration: 460,
        game_type: "blockbattle",
        created_at: new Date("2025-05-11T17:10:00Z"),
        game_data: {
            id: 11,
            match_id: 11,
            win_method: "KO",
            player1_weapon1: "pistol",
            player1_weapon2: "laser",
            player1_damage_taken: 100,
            player1_damage_done: 30,
            player1_coins_collected: 2,
            player1_shots_fired: 55,
            player2_weapon1: "shotgun",
            player2_weapon2: "laser",
            player2_damage_taken: 20,
            player2_damage_done: 100,
            player2_coins_collected: 4,
            player2_shots_fired: 60
        }
    }
];



// DASHBOARD USER DATA

export const panuData: DashboardUserData = {
	id: 0,
	username: 'panu',
	password: 'panu',
	ranking_points: 1070,
	avatar_url: 'none',
	games_played_pong: 6,
	wins_pong: 4,
	losses_pong: 2,
	games_played_blockbattle: 5,
	wins_blockbattle: 2,
	losses_blockbattle: 3,
	tournaments_played: 3,
	tournaments_won: 2,
	tournament_points: 5,
	created_at: new Date("2025-05-01T10:00:00Z"),
	updated_at: new Date("2025-05-11T17:10:00Z"),
	deleted_at: null,
	match_history: panuMatchHistory
}