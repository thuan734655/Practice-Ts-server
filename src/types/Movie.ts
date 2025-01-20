export interface IMedia {
  id: number;
  description: string;
  title:string;
  rating: number;
  type: 'Movie' | 'TV Show';  
  status: string;  
  first_air_date?: Date; 
  last_air_date?: Date;  
  release_date?: Date;   
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: string; 
  genres: string[]; 
  movie_name: string; 
  background: string; 
  avatar: string;
  author: string;
}
