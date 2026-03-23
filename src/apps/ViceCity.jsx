import './ViceCity.css';

function ViceCity() {
  const gameUrl = 'https://gta.laszloakos.hu/?cheats=1&autoplay=1';
  return (
    <div className="vicecity-app">
      <iframe
        title="GTA Vice City"
        src={gameUrl}
        className="vicecity-iframe"
        allow="fullscreen; autoplay; gamepad"
      />
    </div>
  );
}

export default ViceCity;
