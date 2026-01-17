import { useState, useEffect } from 'react'
import Glass from './components/Glass'
import Controls from './components/Controls'
import Modal from './components/Modal'
import './App.css'

const PRESETS = {
  latte: { coffee: 30, milk: 60, ice: 0, sugar: 2 },
  cappuccino: { coffee: 40, milk: 50, ice: 0, sugar: 1 },
  frappe: { coffee: 20, milk: 40, ice: 40, sugar: 3 },
}

function App() {
  const [coffee, setCoffee] = useState(30)
  const [milk, setMilk] = useState(30)
  const [ice, setIce] = useState(0)
  const [sugar, setSugar] = useState(1)
  const [favorite, setFavorite] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)

  // Load favorite from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('favoriteCoffee')
    if (saved) {
      setFavorite(JSON.parse(saved))
    }
  }, [])

  const total = coffee + milk + ice

  const adjustValue = (setter, current, delta, max = 100) => {
    setter(Math.max(0, Math.min(max, current + delta)))
  }

  const applyPreset = (preset) => {
    const { coffee, milk, ice, sugar } = PRESETS[preset]
    setCoffee(coffee)
    setMilk(milk)
    setIce(ice)
    setSugar(sugar)
  }

  const reset = () => {
    setCoffee(0)
    setMilk(0)
    setIce(0)
    setSugar(1)
  }

  const saveFavorite = () => {
    const currentSetup = { coffee, milk, ice, sugar }
    localStorage.setItem('favoriteCoffee', JSON.stringify(currentSetup))
    setFavorite(currentSetup)
    alert('✅ Saved as your favorite!')
  }

  const loadFavorite = () => {
    if (favorite) {
      setCoffee(favorite.coffee)
      setMilk(favorite.milk)
      setIce(favorite.ice)
      setSugar(favorite.sugar)
    }
  }

  const handleOrder = () => {
    const ingredients = []
    if (coffee > 0) ingredients.push(`☕ Coffee: ${coffee}%`)
    if (milk > 0) ingredients.push(`🥛 Milk: ${milk}%`)
    if (ice > 0) ingredients.push(`🧊 Ice: ${ice}%`)
    ingredients.push(`🍬 Sugar: ${sugar}/5`)

    setOrderDetails({
      ingredients,
      total
    })
    setIsModalOpen(true)
  }

  return (
    <div className="app">
      <h1>☕ Coffee Builder</h1>
      <div className="container">
        <Glass coffee={coffee} milk={milk} ice={ice} sugar={sugar} />
        <Controls
          coffee={coffee}
          milk={milk}
          ice={ice}
          sugar={sugar}
          total={total}
          favorite={favorite}
          onCoffeeChange={(delta) => adjustValue(setCoffee, coffee, delta)}
          onMilkChange={(delta) => adjustValue(setMilk, milk, delta)}
          onIceChange={(delta) => adjustValue(setIce, ice, delta)}
          onSugarChange={(value) => setSugar(value)}
          onPreset={applyPreset}
          onReset={reset}
          onSaveFavorite={saveFavorite}
          onLoadFavorite={loadFavorite}
          onOrder={handleOrder}
        />
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orderDetails={orderDetails}
      />
    </div>
  )
}

export default App
