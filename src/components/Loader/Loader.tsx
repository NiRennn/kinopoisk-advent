import './Loader.scss'

function Loader() {
  return (
    <div
      className="loader"
      role="progressbar"
      aria-label="Загрузка"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="loader__fill" />
    </div>
  )
}

export default Loader
