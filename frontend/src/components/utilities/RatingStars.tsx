function RatingStars(props: { rating: number }) {
    return (
        <div>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{color: i <= props.rating ? 'gold' : 'gray'}}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default RatingStars;