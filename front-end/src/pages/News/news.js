import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Badge, Offcanvas, Pagination // Import Pagination
} from 'react-bootstrap'; // Make sure Pagination is imported
import { FaBars } from 'react-icons/fa';
import axios from 'axios';
import styles from './news.module.css';
import NavSidebar from '../../components/navSidebar/navSidebar';
import News from '../../components/news/news';

const NewsPage = () => {
    // --- State Variables ---
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileNav, setShowMobileNav] = useState(false);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // <<< How many news items per page

    const categories = ['All', 'Tournaments', 'Strategy', 'Rules', 'Events', 'Interviews', 'Technology', 'Puzzles', 'General']; // Added General

    // --- Fetching Logic (Keep as is) ---
    useEffect(() => {
        const fetchNews = async () => {
             try {
                setLoading(true);
                setError(null);
                const response = await axios.get('http://localhost:8080/news');
                const transformedNews = response.data.map(item => ({
                    id: item.ID, publicId: item.PublicID,
                    title: item.Title || "Untitled", author: item.Author || "Unknown Author",
                    content: item.Contents || "", category: getCategoryFromContent(item.Contents || ""),
                    date: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: Math.ceil((item.Contents || '').length / 1500) || 1,
                    likes: Math.floor(Math.random() * 50) + 5
                }));
                setNews(transformedNews);
                // setFilteredNews(transformedNews); // Don't set filtered here directly anymore
                setLoading(false);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Failed to fetch news. Please check your connection or the server.');
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // --- Helper Function (Keep as is) ---
     const getCategoryFromContent = (content = "") => {
        const contentLower = content.toLowerCase();
        if (contentLower.includes('tournament') || contentLower.includes('championship') || contentLower.includes('won')) return 'Tournaments';
        if (contentLower.includes('strategy') || contentLower.includes('defense') || contentLower.includes('attack')) return 'Strategy';
        if (contentLower.includes('rule') || contentLower.includes('regulation')) return 'Rules';
        if (contentLower.includes('event') || contentLower.includes('exhibition')) return 'Events';
        if (contentLower.includes('interview') || contentLower.includes('speaks')) return 'Interviews';
        if (contentLower.includes('technology') || contentLower.includes('tech') || contentLower.includes('ai')) return 'Technology';
        if (contentLower.includes('puzzle') || contentLower.includes('challenge')) return 'Puzzles';
        return 'General';
    };

    // --- Filtering Logic ---
    useEffect(() => {
        // Filter the original news array
        const results = news.filter(item => {
            const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const contentMatch = item.content?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const matchesSearch = !searchTerm || titleMatch || contentMatch;
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
        setFilteredNews(results);
        setCurrentPage(1); // Reset to page 1 whenever filters change
    }, [searchTerm, activeCategory, news]); // Removed loading dependency here


    // --- Handlers ---
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleCategoryClick = (category) => setActiveCategory(category);
    const handleShowMobileNav = () => setShowMobileNav(true);
    const handleCloseMobileNav = () => setShowMobileNav(false);
    const handleRetryFetch = () => { window.location.reload(); };
    const handleClearFilters = () => { setSearchTerm(''); setActiveCategory('All'); };

    // --- Pagination Calculations ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Slice the *filtered* news array
    const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

    // --- Pagination Change Handler ---
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Optional: Scroll to top of news container when page changes
            // const newsContainer = document.querySelector(`.${styles.newsContainer}`);
            // if (newsContainer) newsContainer.scrollTop = 0;
        }
    };

    // --- Function to render pagination items ---
     const renderPaginationItems = () => {
        let items = [];
        const maxPagesToShow = 5; // Adjust how many page numbers are visible
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust startPage again if endPage reaches the totalPages limit
        const adjustedStartPage = Math.max(1, endPage - maxPagesToShow + 1);


        // Previous Button
        items.push(
            <Pagination.Prev
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
        );

        // First Page and Ellipsis (if needed)
        if (adjustedStartPage > 1) {
             items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>{1}</Pagination.Item>);
             if (adjustedStartPage > 2) {
                 items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
             }
        }


        // Page Numbers
        for (let number = adjustedStartPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

         // Ellipsis and Last Page (if needed)
        if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
            }
            items.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
        }

        // Next Button
        items.push(
            <Pagination.Next
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
        );

        return items;
    };


    // --- Main Render ---
    return (
        <Container fluid className={styles.mainContainer}>
             {/* Hamburger Button (Keep as is) */}
             <Button variant="dark" className={`d-md-none ${styles.mobileNavToggle}`} onClick={handleShowMobileNav} aria-controls="offcanvasNavbar-news" aria-label="Toggle navigation"><FaBars /></Button>

            <Row className={`${styles.pageRow} gx-0`}>
                 {/* Sidebar Area (Keep as is) */}
                <Col md={2} lg={2} className="p-0 d-none d-md-block">
                   <Offcanvas show={showMobileNav} onHide={handleCloseMobileNav} responsive="md" placement="start" className={styles.mobileOffcanvas} id="offcanvasNavbar-news" aria-labelledby="offcanvasNavbarLabel-news">
                        <Offcanvas.Header closeButton closeVariant='white' className="d-md-none"><Offcanvas.Title id="offcanvasNavbarLabel-news">Menu</Offcanvas.Title></Offcanvas.Header>
                        <Offcanvas.Body className={`${styles.mobileOffcanvasBody} p-0`}> <NavSidebar onLinkClick={handleCloseMobileNav} /> </Offcanvas.Body>
                    </Offcanvas>
                 </Col>

                {/* ======== Main Content Area ======== */}
                <Col xs={12} md={10} lg={10} className={styles.content}>
                    {/* Page Header (Keep as is) */}
                    <div className={styles.pageHeader}>
                        <Row><Col> <h1 className={styles.pageTitle}>Chess News</h1> <p className={styles.pageSubtitle}>Stay updated with the latest news</p> </Col></Row>
                         <Row className={styles.controlsSection}>
                             <Col md={6} className="mb-3 mb-md-0"> <Form.Control type="text" placeholder="Search news..." value={searchTerm} onChange={handleSearchChange} className={styles.searchInput} /> </Col>
                             <Col md={6} className={styles.categoriesWrapper}> <div className={styles.categoriesContainer}> {categories.map(category => (<Badge key={category} pill bg={activeCategory === category ? "success" : "secondary"} className={styles.categoryBadge} onClick={() => handleCategoryClick(category)}> {category} </Badge>))} </div> </Col>
                         </Row>
                    </div>

                    {/* News Content - Now shows ONLY current page's items */}
                    <div className={styles.newsContainer}> {/* <<< CSS for this will change */}
                        {loading ? ( <div className={styles.loadingState}><p>Loading news articles...</p></div> )
                         : error ? ( <div className={styles.errorState}><h3>Error Loading News</h3><p>{error}</p><Button variant="outline-light" onClick={handleRetryFetch}>Try Again</Button></div> )
                         // Map over currentItems instead of filteredNews
                         : currentItems.length > 0 ? ( currentItems.map((item, index) => ( <News key={item.id || index} index={index} item={item} /> )) )
                         : !loading ? ( <div className={styles.noResults}><h3>No news found</h3><p>Try adjusting your search or filter criteria.</p><Button variant="outline-light" onClick={handleClearFilters}>Clear Filters</Button></div>)
                         : null // Avoid rendering noResults while still loading initial data
                         }
                    </div>

                    {/* Pagination Controls */}
                     {!loading && !error && filteredNews.length > itemsPerPage && (
                         <div className={styles.paginationContainer}> {/* Changed class */}
                            <Pagination className={styles.paginationControls} size="sm"> {/* Added class */}
                                {renderPaginationItems()}
                            </Pagination>
                        </div>
                     )}
                </Col>
            </Row>
        </Container>
    );
};

export default NewsPage;