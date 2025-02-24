import styles from './statisticsCard.module.css'
import React from 'react';
import { Card } from 'react-bootstrap'


export default function StatisticsCard({title, value, icon}) {
  return (
    <Card className={`${styles.statisticsCard} ${styles.darkGreyBackground}`}>
      <Card.Body className="text-center">
        <i className={`${icon} ${styles.statisticsIcon}`}></i>
        <Card.Title className={styles.statisticsTitle}>{title}</Card.Title>
        <Card.Text className={styles.statisticsValue}>{value}</Card.Text>
      </Card.Body>
    </Card>
  );
}
