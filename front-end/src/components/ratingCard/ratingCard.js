import styles from "../../pages/Profile/profile.module.css"
import { Card, ProgressBar, Row, Col} from 'react-bootstrap'

export default function RatingCard({ title, rating}) {
  return (
    <Card className={`${styles.ratingCard} ${styles.darkGreyBackground}`}>
      <Card.Body>
            {/* <Card.Title className={`${styles.ratingTitle}`}>{title}</Card.Title> */}
            <ProgressBar now={rating} label={`${Math.round(rating * 30)}`} variant="secondary" />
      </Card.Body>
    </Card>
  );
}