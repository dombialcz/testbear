import './Glass.css'

function Glass({ coffee, milk, ice, sugar }) {
  // Calculate the lightness of coffee based on sugar (more sugar = lighter)
  // Sugar ranges from 1-5, affecting lightness from 15% to 35%
  const coffeeLightness = 15 + (sugar - 1) * 5

  // Total liquid percentage
  const total = coffee + milk + ice
  const maxHeight = 300 // Max height of the glass content

  // Calculate heights as percentages of total
  const coffeeHeight = total > 0 ? (coffee / 100) * maxHeight : 0
  const milkHeight = total > 0 ? (milk / 100) * maxHeight : 0
  const iceHeight = total > 0 ? (ice / 100) * maxHeight : 0

  return (
    <div className="glass-container">
      <div className="glass">
        <div className="glass-content">
          {/* Ice layer (top) */}
          {ice > 0 && (
            <div
              className="layer ice"
              style={{ height: `${iceHeight}px` }}
            >
              <div className="ice-cubes">
                <div className="ice-cube"></div>
                <div className="ice-cube"></div>
                <div className="ice-cube"></div>
              </div>
            </div>
          )}
          
          {/* Milk layer (middle) */}
          {milk > 0 && (
            <div
              className="layer milk"
              style={{ height: `${milkHeight}px` }}
            ></div>
          )}
          
          {/* Coffee layer (bottom) */}
          {coffee > 0 && (
            <div
              className="layer coffee"
              style={{
                height: `${coffeeHeight}px`,
                backgroundColor: `hsl(25, 50%, ${coffeeLightness}%)`
              }}
            ></div>
          )}
        </div>
        
        {/* Glass border and shine effect */}
        <div className="glass-border"></div>
        <div className="glass-shine"></div>
      </div>
      
      <div className="stats">
        <div className="stat">☕ Coffee: {coffee}%</div>
        <div className="stat">🥛 Milk: {milk}%</div>
        <div className="stat">🧊 Ice: {ice}%</div>
        <div className="stat">🍬 Sugar: {sugar}/5</div>
        <div className="stat total">Total: {total}%</div>
      </div>
    </div>
  )
}

export default Glass
