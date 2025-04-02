import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import styles from './news.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar';
import News from '../../components/news/news';
import axios from 'axios';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const mockProfile = {
    firstName: "Pesho",
    lastName: "Toshev",
    email: "peshotoshev@gmail.com",
    profilePicture: "https://checkshorturl.com/img/long-short-url-pros-cons.jpg",
    history: ["win", "win", "loss", "loss", "win", "win", "win", "win", "win", "win", "win", "win"],
    rating: [1000, 1500, 800, 1000],
    totalGames: 100,
    totalGamesWon: 23,
    totalGamesLost: 72,
  };
  
  // Categories for filtering
  const categories = ['All', 'Tournaments', 'Strategy', 'Rules', 'Events', 'Interviews', 'Technology', 'Puzzles'];

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/news');
        
        // Transform the API data to match the expected format
        const transformedNews = response.data.map(item => ({
          id: item.ID,
          publicId: item.PublicID,
          title: item.Title,
          author: item.Author,
          content: item.Contents,
          // Set default values for properties not in the API response
          category: getCategoryFromContent(item.Contents), // Derive category from content
          date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
          readTime: Math.ceil(item.Contents.length / 500), // Estimate read time based on content length
          likes: Math.floor(Math.random() * 50) + 5 // Random likes for demo
        }));
        
        setNews(transformedNews);
        setFilteredNews(transformedNews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to fetch news. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // Function to derive category from content (simple implementation)
  const getCategoryFromContent = (content) => {
    const contentLower = content.toLowerCase();
    if (contentLower.includes('tournament') || contentLower.includes('championship') || contentLower.includes('won')) {
      return 'Tournaments';
    } else if (contentLower.includes('strategy') || contentLower.includes('defense') || contentLower.includes('attack')) {
      return 'Strategy';
    } else if (contentLower.includes('rule') || contentLower.includes('regulation')) {
      return 'Rules';
    } else if (contentLower.includes('event') || contentLower.includes('exhibition')) {
      return 'Events';
    } else if (contentLower.includes('interview') || contentLower.includes('speaks')) {
      return 'Interviews';
    } else if (contentLower.includes('technology') || contentLower.includes('tech') || contentLower.includes('ai')) {
      return 'Technology';
    } else if (contentLower.includes('puzzle') || contentLower.includes('challenge')) {
      return 'Puzzles';
    } else {
      return categories[Math.floor(Math.random() * (categories.length - 1)) + 1]; // Random category except 'All'
    }
  };

  // Filter news based on search term and active category
  useEffect(() => {
    if (news.length > 0) {
      const results = news.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
      });
      
      setFilteredNews(results);
    }
  }, [searchTerm, activeCategory, news]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter click
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  return (
    <Container fluid className={styles.mainContainer}>
      <Row className={styles.pageRow}>
        {/* Sidebar */}
        <NavSidebar profile={mockProfile} />
        
        {/* Main Content */}
        <Col xs={10} className={styles.content}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <Row>
              <Col>
                <h1 className={styles.pageTitle}>Chess News</h1>
                <p className={styles.pageSubtitle}>Stay updated with the latest news in the chess world</p>
              </Col>
            </Row>
            
            {/* Search and Filter Section */}
            <Row className={styles.controlsSection}>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
              </Col>
              <Col md={6} className={styles.categoriesWrapper}>
                <div className={styles.categoriesContainer}>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      pill
                      bg={activeCategory === category ? "success" : "secondary"}
                      className={styles.categoryBadge}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
          
          {/* News Content */}
          <div className={styles.newsContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <p>Loading news articles...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <h3>Error</h3>
                <p>{error}</p>
                <Button 
                  variant="outline-success" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredNews.length > 0 ? (
              filteredNews.map((item, index) => (
                <News key={item.id || index} index={index} item={item} />
              ))
            ) : (
              <div className={styles.noResults}>
                <h3>No news found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <Button 
                  variant="outline-success" 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Pagination placeholder */}
          {filteredNews.length > 0 && (
            <div className={styles.pagination}>
              <Button variant="outline-dark" className={styles.paginationButton}>Previous</Button>
              <Badge pill bg="dark" className={styles.paginationBadge}>1</Badge>
              <Badge pill bg="secondary" className={styles.paginationBadge}>2</Badge>
              <Badge pill bg="secondary" className={styles.paginationBadge}>3</Badge>
              <Button variant="outline-dark" className={styles.paginationButton}>Next</Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NewsPage;