import React, { useState } from 'react';
import { Card, Badge, Button, Collapse } from 'react-bootstrap';
import { CalendarIcon, UserIcon, ClockIcon } from 'react-bootstrap-icons';

const News = ({ index, item }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Truncate content for preview
  const previewLength = 150;
  const hasLongContent = item.content.length > previewLength;
  const contentPreview = hasLongContent 
    ? item.content.substring(0, previewLength) + '...' 
    : item.content;

  return (
    <Card 
      key={index} 
      bg="dark" 
      className="news-card"
      style={{
        margin: '20px auto',
        marginBottom: '20px',
        maxWidth: '90%',
        border: '1px solid #2a9d8f',
        borderRadius: '16px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      }}
    >
      {item.category && (
        <Badge 
          bg="success" 
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            fontSize: '0.8rem',
            padding: '6px 10px',
            borderRadius: '12px'
          }}
        >
          {item.category}
        </Badge>
      )}
      
      {item.image && (
        <Card.Img 
          variant="top" 
          src={item.image} 
          style={{
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            maxHeight: '200px',
            objectFit: 'cover'
          }} 
        />
      )}
      
      <Card.Body style={{ color: 'white', padding: '20px' }}>
        <Card.Title 
          style={{ 
            fontSize: '1.4rem', 
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#e9ecef'
          }}
        >
          {item.title}
        </Card.Title>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          marginBottom: '15px',
          fontSize: '0.85rem',
          color: '#adb5bd'
        }}>
          {item.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>{item.author}</span>
            </div>
          )}
          
          {item.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>{item.date}</span>
            </div>
          )}
          
          {item.readTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>{item.readTime} min read</span>
            </div>
          )}
        </div>
        
        <Card.Text>
          {!expanded && contentPreview}
          <Collapse in={expanded}>
            <div>{item.content}</div>
          </Collapse>
        </Card.Text>
        
        {hasLongContent && (
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            style={{ marginTop: '10px', borderRadius: '8px' }}
          >
            {expanded ? 'Read Less' : 'Read More'}
          </Button>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '20px',
          borderTop: '1px solid #495057',
          paddingTop: '15px'
        }}>
          <div>
            <Button 
              variant={liked ? "danger" : "outline-danger"} 
              size="sm" 
              onClick={() => setLiked(!liked)}
              style={{ marginRight: '10px', borderRadius: '8px' }}
            >
              {liked ? 'Liked' : 'Like'} {item.likes ? `(${liked ? item.likes + 1 : item.likes})` : ''}
            </Button>
            
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ borderRadius: '8px' }}
            >
              Share
            </Button>
          </div>
          
          <Button 
            variant={bookmarked ? "warning" : "outline-warning"} 
            size="sm" 
            onClick={() => setBookmarked(!bookmarked)}
            style={{ borderRadius: '8px' }}
          >
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default News;