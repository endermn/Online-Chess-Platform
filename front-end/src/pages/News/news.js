import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import styles from './news.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar';
import News from '../../components/news/news';

const NewsPage = () => {
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
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
  
  // Enhanced news data with additional properties
  const news = [
    {
      title: "Tosho won first place in Bulgaria",
      author: "Bai Ganio",
      content: "Tosho has won first place in the Bulgarian kids tournament. This prestigious achievement marks a significant milestone in his chess career. The tournament featured 32 participants from across the country, and Tosho demonstrated exceptional skill throughout all rounds.",
      category: "Tournaments",
      date: "Feb 24, 2025",
      image: "https://images.unsplash.com/photo-1560174038-da43ac74f01b",
      readTime: 3,
      likes: 42
    },
    {
      title: "New chess federation rules announced for 2025",
      author: "Chess Federation",
      content: "The International Chess Federation has announced new tournament rules that will take effect starting March 2025. These changes aim to improve competition fairness and player experience.",
      category: "Rules",
      date: "Feb 22, 2025",
      readTime: 5,
      likes: 17
    },
    {
      title: "Weekly chess puzzle challenge now available",
      author: "Chess Academy",
      content: "Test your skills with our weekly chess puzzle challenge! This week features a particularly tricky endgame scenario that has stumped even master-level players.",
      category: "Puzzles",
      date: "Feb 20, 2025",
      image: "https://images.unsplash.com/photo-1586165368502-1bad197a6461",
      readTime: 2,
      likes: 28
    },
    {
      title: "Chess strategy: Mastering the Sicilian Defense",
      author: "Grandmaster Ivanov",
      content: "Learn the key principles and tactical motifs of the Sicilian Defense, one of the most popular responses to e4. This comprehensive guide covers main variations and common traps.",
      category: "Strategy",
      date: "Feb 18, 2025",
      readTime: 8,
      likes: 56
    },
    {
      title: "Interview with rising star Anna Petrova",
      author: "Chess Monthly",
      content: "We sat down with 14-year-old prodigy Anna Petrova to discuss her recent tournament victories and her approach to chess training. Her insights on game preparation are invaluable.",
      category: "Interviews",
      date: "Feb 15, 2025",
      readTime: 6,
      likes: 33
    },
    {
      title: "Historic chess sets exhibition opens in Sofia",
      author: "Cultural News",
      content: "A new exhibition featuring historic chess sets from the 15th to 20th centuries has opened at the National Museum. The collection includes pieces once owned by royal families.",
      category: "Events",
      date: "Feb 12, 2025",
      readTime: 4,
      likes: 19
    },
    {
      title: "Chess AI breakthrough: New algorithm surpasses previous champions",
      author: "Tech Review",
      content: "Researchers have developed a new chess AI that has surpassed all previous automated chess engines in benchmark tests. The system uses a novel approach to position evaluation.",
      category: "Technology",
      date: "Feb 10, 2025",
      readTime: 7,
      likes: 48
    },
    {
      title: "Chess Club Championship results announced",
      author: "Local News",
      content: "The annual Chess Club Championship concluded yesterday with surprising results. Several newcomers managed to upset higher-rated opponents, reshuffling the club rankings.",
      category: "Tournaments",
      date: "Feb 8, 2025",
      readTime: 3,
      likes: 22
    }
  ];

  const categories = ['All', 'Tournaments', 'Strategy', 'Rules', 'Events', 'Interviews', 'Technology', 'Puzzles'];

  useEffect(() => {
    // Filter news based on search term and active category
    const results = news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    
    setFilteredNews(results);
  }, [searchTerm, activeCategory]);

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
            {filteredNews.length > 0 ? (
              filteredNews.map((item, index) => (
                <News key={index} index={index} item={item} />
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