export interface IMedia {
  id: number;
  description: string;
  rating: number;
  type: 'Movie' | 'TV Show';  
  status: string;  
  first_air_date?: string; 
  last_air_date?: string;  
  release_date?: string;   
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: string; 
  genres: string[]; 
  movie_name: string; 
  background: string; 
  avatar: string;
}
