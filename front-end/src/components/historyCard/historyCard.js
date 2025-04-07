import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { User, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import styles from './historyCard.module.css';

export default function HistoryCard({index, item, opponent = "Unknown", rating = 1000, date = "Today"}) {
  let gameResult = "";
  let gameColor = "";
  let badgeVariant = "";
  let resultText = "";
  
  console.log(item)
  if (item.IsWin) {
    gameColor = "#38b000";
    badgeVariant = "success";
    resultText = "Victory";
    gameResult = "+" + item.Points;
  } else if (item.IsLoss) {
    console.log("loss")
    gameColor = "#d90429";
    badgeVariant = "danger";
    resultText = "Defeat";
    gameResult = "-12";
    gameResult = "-" + item.Points;
  } else if (item.IsDraw) {
    gameColor = "#8d99ae";
    badgeVariant = "secondary";
    resultText = "Draw";
    gameResult = "+0";
  }

  return (
    <Card className={styles.historyCard}>
      <Card.Body>
        <div className={styles.cardContent}>
          <div className={styles.resultIndicator} style={{ backgroundColor: gameColor }}></div>
          
          <div className={styles.gameInfo}>
            <div className={styles.gameHeader}>
              <Badge bg={badgeVariant} className={styles.resultBadge}>{resultText}</Badge>
              {/* <span className={styles.gameDate}>{date}</span> */}
            </div>
            
            <div className={styles.gameDetails}>
              <div className={styles.playerInfo}>
                <User size={16} />
                <span className={styles.opponentName}>{opponent}</span>
              </div>
              
              <div className={styles.gameStats}>
                <div className={styles.statItem}>
                  <Clock size={16} />
                  <span>10 min</span>
                </div>
                
                <div className={styles.statItem}>
                  <TrendingUp size={16} />
                  <span className={styles.ratingChange} style={{ color: gameColor }}>{gameResult}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Card.Body>
    </Card>
  );
}