import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';


const defaultEndpoint = `https://rickandmortyapi.com/api/character/`;

export async function getServerSideProps() {
  const resp = await fetch(defaultEndpoint)
  const datos = await resp.json();
  return {
    props: {
      datos
    }
  }
}


export default function Home({ datos }) {
  const { info, results: defaultResultados = [] } = datos;
  const [resultados, updateResultados] = useState(defaultResultados);
  const [pagina, updatePagina] = useState({
    ...info,
    current: defaultEndpoint
  });

  //tomo el valor de la pagin actual
  const { current } = pagina;

  //cuando el valor de current cambie, se va a ejecutar el useEffect
  useEffect(() => {
    if (current === defaultEndpoint) return;

    //si el valor de current cambia, hago una llamada ajax para la nueva info
    async function request() {
      const resp = await fetch(current);
      const proxPagina = await resp.json();
      //cambio el valor de la pagina actual
      updatePagina({
        current,
        ...proxPagina.info
      });

      //si no hay pagina previa, cargo los datos
      if ( !proxPagina.info.prev ) {
        updateResultados(proxPagina.results);
        return;
      }

      //si hay pagina previa, le agrego los nuevos datos
      updateResultados(prev => {
        return [
          ...prev,
          ...proxPagina.results
        ]
      });
    }

    request();
  }, [current]);

  function handleLoadMore() {
    updatePagina(prev => {
      return {
        ...prev,
        current: pagina?.next
      }
    });
  }

  function handleOnSubmitSearch(e) {
    e.preventDefault();

    //capturo los valores del evento
    const { currentTarget = {} } = e;
    //cargo los elementos del evento
    const fields = Array.from(currentTarget?.elements);

    const fieldQuery = fields.find(field => field.name === 'query');
    //obtengo el valor ingresado
    const value = fieldQuery.value || '';
    //armo el endpoint para la llamada AJAX
    const endpoint = `https://rickandmortyapi.com/api/character/?name=${value}`;

    //actualizo la pagina con los resultados de la busqueda
    updatePagina({
      current: endpoint
    });
  }
  return (
    <div className="container">
      <Head>
        <title>Wiki de personajes de Rick & Morty</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Wubba Lubba Dub Dub!
        </h1>

        <p className="description">
          Wiki de personajes de Rick & Morty
        </p>

        <form className="search" onSubmit={handleOnSubmitSearch}>
          <input name="query" type="search" />
          <button>Buscar</button>
        </form>

        <ul className="grid">
          {resultados.map(resultado => {
            const { id, name, image } = resultado;
            return(
              <li key={id} className="card">
                <Link href="/characters/[id]" as={`/characters/${id}`}>
                  <a>
                    <img src={image} alt={`${name}`} />
                    <h3>{ name }</h3>
                  </a>
                </Link>
              </li>
            )
          })}
        </ul>
        <p>
          <button onClick={handleLoadMore}>Cargar mas..</button>
        </p>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        .search input {
          margin-right: .5em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }

          .search input {
            margin-right: 0;
            margin-bottom: .5em;
          }

          .search input,
          .search button {
            width: 100%;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
