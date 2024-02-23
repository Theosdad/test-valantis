export const Product = ({ product }) => {
    return (
        <li className="product" id={product.id}>
            <img src={`https://placehold.co/400x400?text=${product.product}`} alt={product.product} />
            <h2>{product.product}</h2>
            <span>{product.price} руб. </span>
            <span> {product.brand || 'Нет информации о бренде'}</span>
        </li>
    );
};

