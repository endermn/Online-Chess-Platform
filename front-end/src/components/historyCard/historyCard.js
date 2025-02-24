import React from 'react';
import { Card } from 'react-bootstrap'


export default function HistoryCard({index, item}) {

	let gameColor = "";
	if (item === "win") {
		gameColor = "#00ff80"
	} else if (item == "loss") {
		gameColor = "red"
	} else {
		gameColor = "white";
	}

	return (
		<Card key={index} bg="dark" style={{ borderLeft: `5px solid ${gameColor}`, color: "white", marginBottom: '10px' }}>
			<Card.Body>
				<Card.Title>Item {index + 1}</Card.Title>
				<Card.Text>
					<strong>Value:</strong> {item}<br />
				</Card.Text>
			</Card.Body>
		</Card>
	);
}