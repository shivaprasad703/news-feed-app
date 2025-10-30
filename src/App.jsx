import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCw, AlertTriangle, Sun, Moon } from 'lucide-react';


const API_KEY = 'faf8ec9deed7c45a498a7a5d7b3e5d41';
const BASE_URL = 'https://gnews.io/api/v4/top-headlines';
const DEFAULT_QUERY = 'technology';


const CATEGORIES = ['General', 'Technology', 'Sports', 'Business', 'Health', 'Science', 'Entertainment'];


const ArticleCard = ({ article }) => {
  const { image, title, description, url, source } = article;
  
  
  const imageUrl = image || 'https://placehold.co/600x400/1e293b/cbd5e1?text=No+Image';

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" 
       className="block h-full transition duration-300 transform hover:scale-[1.02] hover:shadow-xl rounded-xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
        
        {/* Image */}
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition duration-300 ease-in-out hover:opacity-90"
         
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e293b/cbd5e1?text=No+Image'; }}
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col justify-between flex-grow">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {source?.name || 'Unknown Source'}
            </span>
            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
              {title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {description || 'No description available for this article.'}
            </p>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Read full article &rarr;
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

// --- Component: SearchBar ---
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only search if the query is not empty
    if (query.trim()) {
        onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center border-2 border-indigo-500 rounded-full bg-white dark:bg-gray-700 shadow-md overflow-hidden transition-colors duration-300">
        <input
          type="text"
          placeholder="Search for news articles by keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 px-6 text-lg text-gray-800 dark:text-white bg-transparent focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 transition duration-150 active:scale-[0.98]"
        >
          <Search className="w-5 h-5 mr-2" /> Search
        </button>
      </div>
    </form>
  );
};

const ThemeToggle = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition duration-300 z-50"
        aria-label="Toggle Theme"
    >
        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
);



const App = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [theme, setTheme] = useState(() => {
    // Initialize theme from system preference or default to light
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };
  
  
  const fetchNews = useCallback(async (query, selectedCategory) => {
    if (!API_KEY || API_KEY === 'YOUR_ACTUAL_GNEWS_API_KEY') {
        setError("API Key is missing. Please update the API_KEY variable in the code.");
        return;
    }
    
    setLoading(true);
    setError(null);
    
    let url = `${BASE_URL}?token=${API_KEY}&lang=en&max=10`;

    
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    } else if (selectedCategory) {
      url += `&topic=${selectedCategory.toLowerCase()}`;
    } else {
        url += `&q=${DEFAULT_QUERY}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.errors?.[0] || 'Unknown issue'}`);
      }
      const data = await response.json();
      
      
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to fetch news. ${err.message}. Please check your API key, topic, or search query.`);
    } finally {
      setLoading(false);
    }
  }, [API_KEY]); 

  
  useEffect(() => {
    
    if (searchQuery) {
        fetchNews(searchQuery, null);
    } else {
        fetchNews(null, category);
    }
  }, [searchQuery, category, fetchNews]);

  
  const handleSearch = (query) => {
    setSearchQuery(query); 
    setCategory(''); 
  };

 
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory); 
    setSearchQuery(''); 
  };

  

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center py-20 bg-red-50 dark:bg-gray-800 p-8 rounded-xl shadow-inner border border-red-200 dark:border-red-900">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">Error Loading Data</p>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">{error}</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-20">
          <RotateCw className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
          <p className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">Loading news...</p>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-20 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            No articles found.
          </p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try searching for a different keyword or selecting another category.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {articles.map((article, index) => (
          // Using a combination of URL and index for a stable key
          <ArticleCard key={article.url || index} article={article} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
        <div className="container mx-auto px-4">
            
            {/* Header */}
            <header className="text-center mb-10">
                <h1 className="text-6xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 drop-shadow-md">
                    The React News Feed
                </h1>
                <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">
                    Your source for the latest headlines.
                </p>
            </header>

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Category Filters */}
            <div className="flex justify-center flex-wrap gap-2 mb-10 p-2 max-w-4xl mx-auto">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 shadow-md ${
                            category === cat && !searchQuery
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                        }`}
                        // Disable category button if a search query is active
                        disabled={!!searchQuery}
                        title={searchQuery ? 'Clear search to filter by category' : ''}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Clear Search Button */}
            {searchQuery && (
                <div className="text-center mb-8">
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                        Showing results for: <span className="font-bold text-indigo-500">"{searchQuery}"</span>
                    </p>
                    <button 
                        onClick={() => handleSearch('')} 
                        className="text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        &larr; Show {CATEGORIES[0]} headlines
                    </button>
                </div>
            )}
            
            {/* Main Content (Articles, Loading, Error) */}
            <main className="mt-8">
                {renderContent()}
            </main>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        </div>
    </div>
  );
};

export default App;