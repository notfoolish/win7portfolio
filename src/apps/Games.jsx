import './Games.css'

const WEB_GAMES = [
  {
    title: 'GTA: Vice City (reVCDOS)',
    reason: 'Now integrated as a startup app window using the local /vicecity/ backend route.',
  },
  {
    title: 'Tic-Tac-Toe',
    reason: 'Simple 3x3 grid, turn logic, and win-check rules are straightforward in React.',
  },
  {
    title: 'Snake',
    reason: 'Canvas/grid movement with keyboard controls is browser-friendly and performant.',
  },
  {
    title: 'Memory Match',
    reason: 'Card flip state and match detection are quick to build and fun to play.',
  },
  {
    title: 'DOOM (Shareware)',
    reason: 'Real DOS DOOM can run in-browser using js-dos and the legal shareware WAD files.',
  },
]

function Games() {
  return (
    <div className="games-app">
      <div className="games-header">Games Library</div>

      <div className="games-subtitle">
        These are good candidates to build directly in this website:
      </div>

      <ul className="games-list">
        {WEB_GAMES.map((game) => (
          <li key={game.title} className="games-item">
            <div className="games-item-title-row">
              <span className="games-item-title">{game.title}</span>
            </div>
            <p className="games-item-reason">{game.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Games
