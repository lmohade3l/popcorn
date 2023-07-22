import { useState , useEffect } from "react";
const KEY = 'ceb66389';
export function useMovies(query , callback) {

    const [movies, setMovies] = useState([]);
  const [is_loading , set_is_loading] = useState(false);
  const [error , set_error] = useState('');


    useEffect(function () {

        // callback?.();
        const controller = new AbortController();
    
        async function fetch_movies() {
          try {
            set_is_loading(true);
            //FIXME what?
            set_error('');
            const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}` , {signal: controller.signal});
    
            if(!res.ok) throw new Error("Something went wrong!");
    
            const data = await res.json();
            
            if(data.Response === 'False') throw new Error('Movie not found!');
            
            setMovies(data.Search);
            set_error('');
    
          } catch(err) {
            console.error(err.message);
    
            if(err.name !== 'AbortError') set_error(err.message);
            
          } finally {
            set_is_loading(false);
          }
        }
        if(query.length < 3) {
          setMovies([]);
          set_error('');
          return
        }
        // close_movie();
        fetch_movies();
    
        //Clean up
        return function() {
          controller.abort();
        }
      } , [query ]);

      return {movies , is_loading , error}
}