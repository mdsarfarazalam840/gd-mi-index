
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
}

export async function searchMovieMetadata(filename: string): Promise<{ posterUrl: string | null, backdropUrl: string | null, title: string | null, overview: string | null }> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not set');
        return { posterUrl: null, title: null, overview: null };
    }

    try {
        // Simple cleanup: remove extension and common release group patterns
        // e.g., "Annabella.2014.1080p.mkv" -> "Annabella 2014"
        const cleanName = filename
            .replace(/\.[^/.]+$/, "") // Remove extension
            .replace(/[._]/g, " ") // Replace dots/underscores with spaces
            .replace(/\b(1080p|720p|480p|WEB-DL|BluRay|HDTV|x264|x265|AAC|AAC5\.1)\b.*/i, "") // Remove common tech specs
            .trim();

        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanName)}&include_adult=false&language=en-US&page=1`
        );

        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const results: TMDBMovie[] = data.results;

        if (results && results.length > 0) {
            const bestMatch = results[0]; // Take the first result
            return {
                posterUrl: bestMatch.poster_path ? `${TMDB_IMAGE_BASE_URL}${bestMatch.poster_path}` : null,
                backdropUrl: bestMatch.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${bestMatch.backdrop_path}` : null,
                title: bestMatch.title,
                overview: bestMatch.overview
            };
        }

        return { posterUrl: null, backdropUrl: null, title: null, overview: null };
    } catch (error) {
        console.error('Error fetching TMDB metadata:', error);
        return { posterUrl: null, backdropUrl: null, title: null, overview: null };
    }
}
