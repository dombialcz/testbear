import './Controls.css'

function Controls({
  coffee,
  milk,
  ice,
  sugar,
  total,
  favorite,
  onCoffeeChange,
  onMilkChange,
  onIceChange,
  onSugarChange,
  onPreset,
  onReset,
  onSaveFavorite,
  onLoadFavorite,
  onOrder
}) {
  const isMaxed = total >= 100
  return (
    <div className="controls">
      <div className="section">
        <h2>Ingredients</h2>
        
        <div className="control-group">
          <label>☕ Coffee</label>
          <div className="buttons">
            <button onClick={() => onCoffeeChange(-10)} disabled={coffee === 0}>
              -
            </button>
            <span className="value">{coffee}%</span>
            <button onClick={() => onCoffeeChange(10)} disabled={coffee === 100 || isMaxed}>
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>🥛 Milk</label>
          <div className="buttons">
            <button onClick={() => onMilkChange(-10)} disabled={milk === 0}>
              -
            </button>
            <span className="value">{milk}%</span>
            <button onClick={() => onMilkChange(10)} disabled={milk === 100 || isMaxed}>
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>🧊 Ice</label>
          <div className="buttons">
            <button onClick={() => onIceChange(-10)} disabled={ice === 0}>
              -
            </button>
            <span className="value">{ice}%</span>
            <button onClick={() => onIceChange(10)} disabled={ice === 100 || isMaxed}>
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>🍬 Sugar</label>
          <div className="sugar-levels">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`sugar-btn ${sugar === level ? 'active' : ''}`}
                onClick={() => onSugarChange(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Presets</h2>
        <div className="preset-buttons">
          <button className="preset-btn latte" onClick={() => onPreset('latte')}>
            Caffè Latte
          </button>
          <button className="preset-btn cappuccino" onClick={() => onPreset('cappuccino')}>
            Cappuccino
          </button>
          <button className="preset-btn frappe" onClick={() => onPreset('frappe')}>
            Frappé
          </button>
        </div>
      </div>

      <div className="section">
        <h2>Actions</h2>
        <div className="action-buttons">
          <button className="order-btn" onClick={onOrder}>
            📦 Order
          </button>
          <button className="favorite-btn" onClick={onSaveFavorite}>
            ⭐ Save as Favorite
          </button>
          {favorite && (
            <button className="load-favorite-btn" onClick={onLoadFavorite}>
              💖 Load My Favorite
            </button>
          )}
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>
        🔄 Reset
      </button>
    </div>
  )
}

export default Controls
