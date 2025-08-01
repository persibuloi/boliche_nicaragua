import React, { useState, useEffect } from 'react'
import { Trophy, Users, Target, AlertCircle, RotateCcw, Play, Crown, Medal, X } from 'lucide-react'

// Interfaces para el sistema de torneo
interface Player {
  id: string
  name: string
  handicap: number
  isActive: boolean
  scores: number[] // Puntajes por línea (sin handicap)
  totalScore: number // Puntaje total con handicap
  position?: number // Posición final en el torneo
}

interface Round {
  number: number
  name: string
  playersCount: number
  eliminatedCount: number
  players: Player[]
  completed: boolean
  eliminatedPlayers?: Player[] // Jugadores eliminados en esta ronda
}

export function BracketTournamentSection() {
  // Estados del torneo
  const [players, setPlayers] = useState<Player[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [rounds, setRounds] = useState<Round[]>([])
  const [tournamentStarted, setTournamentStarted] = useState(false)
  const [tournamentCompleted, setTournamentCompleted] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)
  const [runnerUp, setRunnerUp] = useState<Player | null>(null)

  // Estados para registro de jugadores
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('')

  // Estados para ingreso de puntajes
  const [currentLineScores, setCurrentLineScores] = useState<{[playerId: string]: string}>({})

  // Inicializar rondas del torneo
  useEffect(() => {
    const initialRounds: Round[] = [
      { number: 1, name: 'Línea 1 - Eliminación (8→6)', playersCount: 8, eliminatedCount: 2, players: [], completed: false },
      { number: 2, name: 'Línea 2 - Eliminación (6→4)', playersCount: 6, eliminatedCount: 2, players: [], completed: false },
      { number: 3, name: 'Línea 3 - Eliminación (4→2)', playersCount: 4, eliminatedCount: 2, players: [], completed: false },
      { number: 4, name: 'Línea 4 - Final (2→1)', playersCount: 2, eliminatedCount: 1, players: [], completed: false }
    ]
    setRounds(initialRounds)
  }, [])

  // Función para agregar jugador
  const addPlayer = () => {
    if (newPlayerName.trim() && newPlayerHandicap.trim() && players.length < 8) {
      const handicap = parseInt(newPlayerHandicap)
      if (handicap >= 0 && handicap <= 50) {
        const newPlayer: Player = {
          id: `player-${Date.now()}`,
          name: newPlayerName.trim(),
          handicap: handicap,
          isActive: true,
          scores: [],
          totalScore: 0
        }
        setPlayers([...players, newPlayer])
        setNewPlayerName('')
        setNewPlayerHandicap('')
      }
    }
  }

  // Función para eliminar jugador
  const removePlayer = (playerId: string) => {
    if (!tournamentStarted) {
      setPlayers(players.filter(p => p.id !== playerId))
    }
  }

  // Función para iniciar torneo
  const startTournament = () => {
    if (players.length === 8) {
      setTournamentStarted(true)
      const updatedRounds = [...rounds]
      updatedRounds[0].players = [...players]
      setRounds(updatedRounds)
    }
  }

  // Función para calcular puntaje con handicap
  const calculateScoreWithHandicap = (score: number, handicap: number): number => {
    return score + handicap
  }

  // Función para procesar línea y eliminar jugadores
  const processLine = () => {
    const currentRoundData = rounds[currentRound]
    const activePlayers = currentRoundData.players.filter(p => p.isActive)
    
    // Validar que todos los jugadores activos tengan puntaje
    const hasAllScores = activePlayers.every(player => 
      currentLineScores[player.id] && 
      !isNaN(parseInt(currentLineScores[player.id]))
    )

    if (!hasAllScores) {
      alert('Por favor ingresa los puntajes de todos los jugadores activos')
      return
    }

    // Actualizar puntajes de jugadores
    const updatedPlayers = activePlayers.map(player => {
      const lineScore = parseInt(currentLineScores[player.id])
      const newScores = [...player.scores, lineScore]
      const totalScore = newScores.reduce((sum, score, index) => 
        sum + calculateScoreWithHandicap(score, player.handicap), 0
      )
      
      return {
        ...player,
        scores: newScores,
        totalScore: totalScore
      }
    })

    // Ordenar por puntaje total (mayor a menor)
    updatedPlayers.sort((a, b) => b.totalScore - a.totalScore)

    // Determinar eliminados
    const playersToAdvance = updatedPlayers.length - currentRoundData.eliminatedCount
    const advancingPlayers = updatedPlayers.slice(0, playersToAdvance)
    const eliminatedPlayers = updatedPlayers.slice(playersToAdvance)

    // Marcar eliminados como inactivos
    eliminatedPlayers.forEach(player => {
      player.isActive = false
      player.position = updatedPlayers.length - eliminatedPlayers.indexOf(player)
    })

    // Actualizar ronda actual
    const updatedRounds = [...rounds]
    updatedRounds[currentRound].players = updatedPlayers
    updatedRounds[currentRound].completed = true
    updatedRounds[currentRound].eliminatedPlayers = eliminatedPlayers

    // Si no es la última ronda, preparar la siguiente
    if (currentRound < rounds.length - 1) {
      updatedRounds[currentRound + 1].players = advancingPlayers
      setCurrentRound(currentRound + 1)
    } else {
      // Torneo completado
      setTournamentCompleted(true)
      setWinner(advancingPlayers[0])
      setRunnerUp(eliminatedPlayers[0])
    }

    setRounds(updatedRounds)
    setCurrentLineScores({})
  }

  // Función para reiniciar torneo
  const resetTournament = () => {
    setPlayers([])
    setCurrentRound(0)
    setTournamentStarted(false)
    setTournamentCompleted(false)
    setWinner(null)
    setRunnerUp(null)
    setCurrentLineScores({})
    
    const resetRounds: Round[] = [
      { number: 1, name: 'Línea 1 - Eliminación (8→6)', playersCount: 8, eliminatedCount: 2, players: [], completed: false },
      { number: 2, name: 'Línea 2 - Eliminación (6→4)', playersCount: 6, eliminatedCount: 2, players: [], completed: false },
      { number: 3, name: 'Línea 3 - Eliminación (4→2)', playersCount: 4, eliminatedCount: 2, players: [], completed: false },
      { number: 4, name: 'Línea 4 - Final (2→1)', playersCount: 2, eliminatedCount: 1, players: [], completed: false }
    ]
    setRounds(resetRounds)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-bowling-orange-500 mr-3" />
            <h1 className="text-3xl lg:text-4xl font-bold text-bowling-black-900">
              Torneo por Eliminación
            </h1>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistema de eliminación por brackets: 8 jugadores, 4 líneas. En cada línea se eliminan los 2 jugadores con menor puntaje con hándicap.
          </p>
        </div>

        {/* Registro de Jugadores */}
        {!tournamentStarted && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-bowling-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Registro de Jugadores ({players.length}/8)
              </h2>
            </div>

            {/* Formulario para agregar jugadores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Nombre del jugador"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-blue-500 focus:border-transparent"
                maxLength={30}
              />
              <input
                type="number"
                placeholder="Hándicap (0-50)"
                value={newPlayerHandicap}
                onChange={(e) => setNewPlayerHandicap(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-blue-500 focus:border-transparent"
                min="0"
                max="50"
              />
              <button
                onClick={addPlayer}
                disabled={players.length >= 8 || !newPlayerName.trim() || !newPlayerHandicap.trim()}
                className="px-6 py-2 bg-bowling-blue-500 text-white rounded-lg hover:bg-bowling-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Agregar Jugador
              </button>
            </div>

            {/* Lista de jugadores registrados */}
            {players.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-bowling-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{player.name}</p>
                        <p className="text-sm text-gray-600">Hándicap: {player.handicap}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para iniciar torneo */}
            {players.length === 8 && (
              <div className="text-center">
                <button
                  onClick={startTournament}
                  className="px-8 py-3 bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 text-white rounded-lg font-semibold hover:from-bowling-orange-600 hover:to-bowling-orange-700 transition-all duration-200 flex items-center mx-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Torneo
                </button>
              </div>
            )}

            {players.length < 8 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800">
                  Se necesitan exactamente 8 jugadores para iniciar el torneo.
                  Faltan {8 - players.length} jugador{8 - players.length !== 1 ? 'es' : ''}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progreso del Torneo */}
        {tournamentStarted && (
          <div className="space-y-8">
            {/* Indicador de progreso */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Progreso del Torneo</h3>
              <div className="flex justify-between items-center mb-4">
                {rounds.map((round, index) => (
                  <div key={round.number} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      round.completed ? 'bg-green-500 text-white' :
                      index === currentRound ? 'bg-bowling-orange-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {round.number}
                    </div>
                    {index < rounds.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        round.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">
                  {tournamentCompleted ? 'Torneo Completado' : rounds[currentRound]?.name}
                </p>
              </div>
            </div>

            {/* Historial de eliminados por ronda */}
            {rounds.some(round => round.eliminatedPlayers && round.eliminatedPlayers.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <X className="w-6 h-6 text-red-500 mr-2" />
                  Jugadores Eliminados por Ronda
                </h3>
                <div className="space-y-4">
                  {rounds.map((round) => {
                    if (!round.eliminatedPlayers || round.eliminatedPlayers.length === 0) return null
                    
                    return (
                      <div key={round.number} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-red-800">
                            {round.name}
                          </h4>
                          <span className="text-sm text-red-600 font-medium">
                            Eliminados: {round.eliminatedPlayers.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {round.eliminatedPlayers.map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center">
                                <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-800">{player.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Puntaje: {player.totalScore}</p>
                                <p className="text-xs text-gray-500">Hándicap: {player.handicap}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ingreso de puntajes para la línea actual */}
            {!tournamentCompleted && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-bowling-orange-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {rounds[currentRound]?.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {rounds[currentRound]?.players.filter(p => p.isActive).map((player) => (
                    <div key={player.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-800">{player.name}</h4>
                        <span className="text-sm text-gray-600">Hándicap: {player.handicap}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Puntaje Línea {currentRound + 1}:</label>
                        <input
                          type="number"
                          placeholder="0-300"
                          value={currentLineScores[player.id] || ''}
                          onChange={(e) => setCurrentLineScores({
                            ...currentLineScores,
                            [player.id]: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-bowling-blue-500 focus:border-transparent"
                          min="0"
                          max="300"
                        />
                      </div>
                      {player.scores.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Puntajes anteriores: {player.scores.join(', ')}</p>
                          <p className="font-medium">Total con hándicap: {player.totalScore}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={processLine}
                    className="px-8 py-3 bg-gradient-to-r from-bowling-blue-500 to-bowling-blue-600 text-white rounded-lg font-semibold hover:from-bowling-blue-600 hover:to-bowling-blue-700 transition-all duration-200"
                  >
                    Procesar Línea {currentRound + 1}
                  </button>
                </div>
              </div>
            )}

            {/* Resultados del torneo */}
            {tournamentCompleted && winner && runnerUp && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
                  🏆 Resultados del Torneo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Ganador */}
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                    <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-yellow-800 mb-2">🥇 CAMPEÓN</h4>
                    <p className="text-lg font-semibold text-gray-800">{winner.name}</p>
                    <p className="text-sm text-gray-600">Hándicap: {winner.handicap}</p>
                    <p className="text-lg font-bold text-yellow-700 mt-2">
                      Puntaje Final: {winner.totalScore}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Puntajes por línea: {winner.scores.join(', ')}</p>
                    </div>
                  </div>

                  {/* Subcampeón */}
                  <div className="text-center p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                    <Medal className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">🥈 SUBCAMPEÓN</h4>
                    <p className="text-lg font-semibold text-gray-800">{runnerUp.name}</p>
                    <p className="text-sm text-gray-600">Hándicap: {runnerUp.handicap}</p>
                    <p className="text-lg font-bold text-gray-700 mt-2">
                      Puntaje Final: {runnerUp.totalScore}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Puntajes por línea: {runnerUp.scores.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Tabla de posiciones finales */}
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Tabla de Posiciones Finales</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Posición</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Jugador</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Hándicap</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Puntaje Final</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Líneas Jugadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rounds.flatMap(round => round.players)
                        .filter((player, index, self) => self.findIndex(p => p.id === player.id) === index)
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map((player, index) => (
                          <tr key={player.id} className={index < 2 ? 'bg-yellow-50' : ''}>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">
                              {index === 0 ? '🥇 1°' : index === 1 ? '🥈 2°' : `${index + 1}°`}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{player.name}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{player.handicap}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {player.totalScore}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {player.scores.length}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Botón para reiniciar */}
            <div className="text-center">
              <button
                onClick={resetTournament}
                className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center mx-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nuevo Torneo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
