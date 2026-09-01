function ItemSkeleton() {
    return (
        <div className="card item-card">
            <div className="skeleton skeleton-image" />

            <div className="card-body">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "14px",
                    }}
                >
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton skeleton-badge" />
                </div>

                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text short" />
            </div>
        </div>
    );
}

export default ItemSkeleton;