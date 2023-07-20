import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 'ceb66389';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [is_loading , set_is_loading] = useState(false);
  const [error , set_error] = useState('');
  const [query, setQuery] = useState("");
  const [selected_id , set_selected_id] = useState(''); 

  /*
  useEffect(function () {
    console.log("after initial render");
  },[]);
  useEffect(function () {
    console.log("after every render");
  });
  useEffect(function () {
    console.log("after changes in [query]");
  } , [query]);
  console.log("during render");
  */

  function handle_select_movie(id) {
    if(selected_id===id) set_selected_id(null);
    else set_selected_id(id);
  }

  function close_movie() {
    set_selected_id(null);
    //FIXME why can't we just do this? instead of the clean up?
    // document.title = 'Popcorn';
  }

  function handle_add_watched(movie) {
    setWatched(watched => [...watched , movie]);
  }

  function handle_delete(id){
    setWatched(watched => watched.filter(movie=> movie.imdbID!==id));

  }

  

  useEffect(function () {
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
    close_movie();
    fetch_movies();

    //Clean up
    return function() {
      controller.abort();
    }
  } , [query]);

  return (
    <>
      <Navbar>
          <Logo />
          <Search query={query} setQuery={setQuery}/>
          <NumResults movies={movies}/>
      </Navbar>

      <Main>
        <Box>
          {is_loading && <Loader />}
          {!is_loading && !error && <MovieList movies={movies} onSelectMovie={handle_select_movie}/>}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selected_id ? <MovieDetails 
                            selected_id={selected_id} 
                            onCloseMovie={close_movie} 
                            onAddWatched={handle_add_watched}
                            watchedMovies={watched}/> :
            <>
              <WatchedSummary watched={watched}/>
              <WatchedMoviesList watched={watched} onDelete={handle_delete}/>
            </>}
        </Box>
      </Main>
    </>
  );
}


function Navbar({children}) {
  return (
    <nav className="nav-bar">{children}</nav>
  )
};

function ErrorMessage({message}) {
  return <p className="error">{message}</p>
}

function Loader() {
  return <p className="loader">Loading...</p>
}

function Search({query, setQuery}) {
  
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function Logo() {
  return (
    <div className="logo">
        <span role="img">🍿</span>
        <h1>Popcorn</h1>
    </div>
  )
}

function NumResults({movies}) {
  return (
    <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({children}) {
  return (
    <main className="main">
        {children}
    </main>
  )
}


function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched}/>
//           <WatchedMoviesList watched={watched}/>
//         </>
//       )}
//     </div>
//   )
// }


function MovieList({movies , onSelectMovie}) {
  return (
    <ul className="list list-movies">
        {movies?.map((movie) => <Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID}/>)}
    </ul>
  )
}

function Movie({movie , onSelectMovie}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({selected_id , onCloseMovie , onAddWatched , watchedMovies}) {
  const [movie , set_movie] = useState({});
  const [detail_loading , set_detail_loading] = useState(false);
  const [user_rating , set_user_rating] = useState('');

  const is_watched = watchedMovies.map(movie => movie.imdbID).includes(selected_id);
  const watched_user_rating = watchedMovies.find(movie => movie.imdbID===selected_id)?.user_rating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie;


  useEffect(function () {
    function callback(e) {
      if(e.code === 'Escape') onCloseMovie();
    }

    document.addEventListener('keydown' , callback);

    return function() {
      document.removeEventListener('keydown' , callback);
    }
  } , [onCloseMovie])

  //we need to show a movie detail each time this renders : useEffect
  useEffect(function() {
    async function get_movie_details() {
      set_detail_loading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selected_id}`);
      const data = await res.json();
      set_movie(data);
      set_detail_loading(false);
    }
    get_movie_details();
  }, [selected_id])

  //Change name of title to the movie title
  useEffect(function() {
    if(!title) return;
    document.title = `Movie | ${title}`;

    //Clean up
    return function() {
      document.title = 'Popcorn';
    }
  } , [title])

 
  function handle_add() {
    const new_watched_movie ={
      imdbID: selected_id,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      user_rating,
    }

    onAddWatched(new_watched_movie);
    onCloseMovie();
  }

  return <div className="details">
 
    {detail_loading ? <Loader /> : 
    <>

    <header>
      <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
      
      <img src={poster} alt={`poster of the ${title}`} />
      <div className="details-overview">
        <h2>{title}</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p><span>⭐</span>{imdbRating}</p>
      </div>
    </header>
    

    <section>
      <div className="rating">
        {!is_watched ? (<> <StarRating maxRating={10} size={24} onSetRating={set_user_rating}/>
        {user_rating > 0 && (<button className="btn-add" onClick={handle_add}>+ Add to list</button>)} </>) :
          (<p>You've rated this movie with {watched_user_rating}/10⭐</p> )}
      </div>
      <p><em>{plot}</em></p>
      <p>Starring: {actors}</p>
      <p>Directed by: {director}</p>
    </section>
    </> }
  </div>
}


function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}


function WatchedMoviesList({watched , onDelete}) {
  return (
    <ul className="list">
      {watched.map((movie) => <WatchedMovie movie={movie} onDelete={onDelete} key={movie.imdbID} />)}
    </ul>
  )
}


function WatchedMovie({movie , onDelete}){
  return (
    <li >
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <button className="btn-delete" onClick={()=> onDelete(movie.imdbID)}>X</button>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.user_rating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  )
}
