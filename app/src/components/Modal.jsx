import './Modal.css'

function Modal({ isOpen, onClose, orderDetails }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" data-testid="order-modal-overlay" onClick={onClose}>
      <div className="modal-content" data-testid="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 data-testid="order-modal-title">📋 Order Summary</h2>
          <button className="close-btn" data-testid="order-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body" data-testid="order-modal-body">
          <div className="order-items">
            {orderDetails.ingredients.map((ingredient, index) => (
              <div key={index} className="order-item" data-testid={`order-item-${index}`}>
                {ingredient}
              </div>
            ))}
          </div>
          
          <div className="order-total" data-testid="order-modal-total">
            Total: {orderDetails.total}%
          </div>
          
          <div className="order-message" data-testid="order-modal-message">
            🎉 Enjoy your coffee!
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="confirm-btn" data-testid="order-modal-confirm" onClick={onClose}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
