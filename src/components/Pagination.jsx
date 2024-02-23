export const Pagination = ({ currentPage, totalPages, onPaginate }) => {
    const handlePageClick = (pageNumber) => {
        onPaginate(pageNumber);
    };

    return (
        <div className="pagination">
            <span className="current-page" style={{marginRight: "auto"}}>Текущая страница: {currentPage}</span>
            <button
                className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &lt;
            </button>
            <button
                className={`next ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                &gt;
            </button>
        </div>
    );
};
