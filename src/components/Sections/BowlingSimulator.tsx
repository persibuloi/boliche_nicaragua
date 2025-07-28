import React, { useState, useEffect } from 'react'
import { Trophy, Users, RotateCcw, Play, Target } from 'lucide-react'

interface Roll {
  pins: number
  isStrike: boolean
  isSpare: boolean
}

interface Frame {
  rolls: Roll[]
  score: number
  isComplete: boolean
  isStrike: boolean
  isSpare: boolean
}

interface Player {
  id: number
  name: string
  frames: Frame[]
  totalScore: number
  currentFrame: number
}

export function BowlingSimulator() {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [selectedPins, setSelectedPins] = useState<number>(0)
  const [numberOfPlayers, setNumberOfPlayers] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>(['', ''])
  const [showSetup, setShowSetup] = useState(false)

  // Inicializar jugadores
  const initializePlayers = () => {
    const newPlayers: Player[] = []
    for (let i = 0; i < numberOfPlayers; i++) {
      const frames: Frame[] = []
      for (let j = 0; j < 10; j++) {
        frames.push({
          rolls: [],
          score: 0,
          isComplete: false,
          isStrike: false,
          isSpare: false
        })
      }
      newPlayers.push({
        id: i + 1,
        name: playerNames[i] || `Jugador ${i + 1}`,
        frames,
        totalScore: 0,
        currentFrame: 0
      })
    }
    setPlayers(newPlayers)
    setCurrentPlayer(0)
    setGameStarted(true)
    setGameFinished(false)
    setShowSetup(false)
  }

  // Calcular puntaje de boliche
  const calculateScore = (playerFrames: Frame[]): number => {
    let totalScore = 0
    
    for (let i = 0; i < 10; i++) {
      const frame = playerFrames[i]
      if (!frame || !frame.rolls || !frame.rolls.length) continue

      if (i < 9) { // Frames 1-9
        if (frame.isStrike) {
          totalScore += 10
          // Bonus: próximos 2 rolls
          const nextFrame = playerFrames[i + 1]
          if (nextFrame && nextFrame.rolls && nextFrame.rolls.length >= 1) {
            totalScore += nextFrame.rolls[0].pins
            if (nextFrame.rolls.length >= 2) {
              totalScore += nextFrame.rolls[1].pins
            } else if (nextFrame.isStrike && i < 8) {
              // Si el siguiente frame es strike, tomar el primer roll del frame siguiente
              const nextNextFrame = playerFrames[i + 2]
              if (nextNextFrame && nextNextFrame.rolls && nextNextFrame.rolls.length >= 1) {
                totalScore += nextNextFrame.rolls[0].pins
              }
            }
          }
        } else if (frame.isSpare) {
          totalScore += 10
          // Bonus: próximo 1 roll
          const nextFrame = playerFrames[i + 1]
          if (nextFrame && nextFrame.rolls && nextFrame.rolls.length >= 1) {
            totalScore += nextFrame.rolls[0].pins
          }
        } else {
          // Frame normal
          totalScore += frame.rolls.reduce((sum, roll) => sum + roll.pins, 0)
        }
      } else { // Frame 10
        totalScore += frame.rolls.reduce((sum, roll) => sum + roll.pins, 0)
      }
    }
    
    return totalScore
  }

  // Agregar roll
  const addRoll = (pins: number) => {
    if (!gameStarted || gameFinished) return

    const newPlayers = [...players]
    const player = newPlayers[currentPlayer]
    const currentFrameIndex = player.currentFrame
    const frame = player.frames[currentFrameIndex]

    const newRoll: Roll = {
      pins,
      isStrike: pins === 10,
      isSpare: false
    }

    frame.rolls.push(newRoll)

    // Lógica para determinar si es strike, spare o frame completo
    if (currentFrameIndex < 9) { // Frames 1-9
      if (pins === 10) { // Strike
        frame.isStrike = true
        frame.isComplete = true
        player.currentFrame++
      } else if (frame.rolls.length === 2) {
        const totalPins = frame.rolls.reduce((sum, roll) => sum + roll.pins, 0)
        if (totalPins === 10) {
          frame.isSpare = true
          frame.rolls[1].isSpare = true
        }
        frame.isComplete = true
        player.currentFrame++
      }
    } else { // Frame 10
      if (frame.rolls.length === 2) {
        const totalPins = frame.rolls[0].pins + frame.rolls[1].pins
        if (totalPins === 10 || frame.rolls[0].pins === 10) {
          // Necesita un tercer roll
        } else {
          frame.isComplete = true
        }
      } else if (frame.rolls.length === 3) {
        frame.isComplete = true
      } else if (frame.rolls.length === 1 && pins !== 10) {
        // Necesita segundo roll
      } else if (frame.rolls.length === 1 && pins === 10) {
        frame.isStrike = true
        // Necesita dos rolls más
      }
    }

    // Calcular puntaje total
    player.totalScore = calculateScore(player.frames)

    // Cambiar al siguiente jugador si el frame está completo
    if (frame.isComplete || (currentFrameIndex < 9 && frame.isStrike)) {
      let nextPlayer = (currentPlayer + 1) % numberOfPlayers
      
      // Verificar si todos los jugadores han completado este frame
      const allPlayersCompletedFrame = newPlayers.every(p => 
        p.currentFrame > currentFrameIndex || 
        (p.currentFrame === currentFrameIndex && p.frames[currentFrameIndex].isComplete)
      )

      if (allPlayersCompletedFrame && currentFrameIndex === 9) {
        setGameFinished(true)
      } else {
        // Encontrar el próximo jugador que no haya completado su frame actual
        while (newPlayers[nextPlayer].currentFrame > currentFrameIndex || 
               (newPlayers[nextPlayer].currentFrame === currentFrameIndex && 
                newPlayers[nextPlayer].frames[currentFrameIndex].isComplete)) {
          nextPlayer = (nextPlayer + 1) % numberOfPlayers
          if (nextPlayer === currentPlayer) break // Evitar bucle infinito
        }
        setCurrentPlayer(nextPlayer)
      }
    }

    setPlayers(newPlayers)
    setSelectedPins(0)
  }

  // Reiniciar juego
  const resetGame = () => {
    setPlayers([])
    setCurrentPlayer(0)
    setGameStarted(false)
    setGameFinished(false)
    setSelectedPins(0)
    setShowSetup(false)
  }

  // Manejar cambio de número de jugadores
  const handleNumberOfPlayersChange = (num: number) => {
    setNumberOfPlayers(num)
    const newNames = Array(num).fill('').map((_, i) => playerNames[i] || '')
    setPlayerNames(newNames)
  }

  // Manejar cambio de nombre de jugador
  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames]
    newNames[index] = name
    setPlayerNames(newNames)
  }

  // Mostrar configuración de jugadores
  const showPlayerSetup = () => {
    setShowSetup(true)
  }

  // Obtener pines disponibles para el roll actual
  const getAvailablePins = (): number[] => {
    if (!gameStarted || gameFinished || !players.length || !players[currentPlayer]) return []
    
    const player = players[currentPlayer]
    if (!player.frames || !player.frames[player.currentFrame]) return []
    const frame = player.frames[player.currentFrame]
    
    if (player.currentFrame < 9) { // Frames 1-9
      if (frame.rolls.length === 0) {
        return Array.from({ length: 11 }, (_, i) => i) // 0-10
      } else if (frame.rolls.length === 1 && !frame.isStrike) {
        const remainingPins = 10 - frame.rolls[0].pins
        return Array.from({ length: remainingPins + 1 }, (_, i) => i) // 0 hasta pines restantes
      }
    } else { // Frame 10
      if (frame.rolls.length === 0) {
        return Array.from({ length: 11 }, (_, i) => i) // 0-10
      } else if (frame.rolls.length === 1) {
        if (frame.rolls[0].pins === 10) {
          return Array.from({ length: 11 }, (_, i) => i) // 0-10 (strike)
        } else {
          const remainingPins = 10 - frame.rolls[0].pins
          return Array.from({ length: remainingPins + 1 }, (_, i) => i)
        }
      } else if (frame.rolls.length === 2) {
        if (frame.rolls[0].pins === 10 || frame.rolls[0].pins + frame.rolls[1].pins === 10) {
          return Array.from({ length: 11 }, (_, i) => i) // 0-10
        }
      }
    }
    
    return []
  }

  const availablePins = getAvailablePins()

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-bowling-black-900 mb-2">
              Simulador de Boliche
            </h1>
            <p className="text-gray-600">
              Simula una partida completa de boliche para 4 jugadores
            </p>
          </div>

          {!gameStarted && !showSetup ? (
            /* Start Game */
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Users className="w-16 h-16 text-bowling-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-bowling-black-900 mb-4">
                ¿Listo para jugar?
              </h2>
              <p className="text-gray-600 mb-6">
                Configura tu partida de boliche personalizada
              </p>
              <div className="space-y-4">
                <button
                  onClick={showPlayerSetup}
                  className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white font-semibold py-4 px-8 rounded-lg hover:from-bowling-orange-600 hover:to-bowling-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  Configurar Jugadores
                </button>
                <div className="text-sm text-gray-500">
                  O inicia rápidamente con 2 jugadores
                </div>
                <button
                  onClick={initializePlayers}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Inicio Rápido
                </button>
              </div>
            </div>
          ) : !gameStarted && showSetup ? (
            /* Player Setup */
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-bowling-orange-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-bowling-black-900 mb-2">
                  Configurar Jugadores
                </h2>
                <p className="text-gray-600">
                  Selecciona el número de jugadores y personaliza sus nombres
                </p>
              </div>

              {/* Número de jugadores */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Número de jugadores:
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumberOfPlayersChange(num)}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                        numberOfPlayers === num
                          ? 'bg-bowling-orange-500 text-white border-bowling-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-bowling-orange-500'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombres de jugadores */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombres de los jugadores:
                </label>
                <div className="grid gap-3">
                  {Array.from({ length: numberOfPlayers }, (_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={playerNames[i] || ''}
                        onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                        placeholder={`Jugador ${i + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowSetup(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={initializePlayers}
                  className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-bowling-orange-600 hover:to-bowling-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Iniciar Partida
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Game Controls */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-bowling-black-900">
                    {gameFinished ? '🏆 Partida Terminada' : `Turno de ${players[currentPlayer]?.name}`}
                  </h2>
                  <button
                    onClick={resetGame}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Nueva Partida
                  </button>
                </div>

                {!gameFinished && (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Frame {players[currentPlayer]?.currentFrame + 1} - Roll {players[currentPlayer]?.frames[players[currentPlayer]?.currentFrame]?.rolls.length + 1}
                    </p>
                    
                    {/* Pin Selection */}
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {availablePins.map(pins => (
                        <button
                          key={pins}
                          onClick={() => addRoll(pins)}
                          className={`py-2 px-3 rounded-lg border-2 transition-all ${
                            pins === 10 
                              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                              : 'bg-white border-gray-300 hover:border-bowling-orange-500 hover:bg-bowling-orange-50'
                          }`}
                        >
                          {pins === 10 ? 'X' : pins}
                        </button>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => addRoll(10)}
                        disabled={!availablePins.includes(10)}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Strike (X)
                      </button>
                      <button
                        onClick={() => {
                          const frame = players[currentPlayer]?.frames[players[currentPlayer]?.currentFrame]
                          if (frame?.rolls.length === 1) {
                            const remainingPins = 10 - frame.rolls[0].pins
                            addRoll(remainingPins)
                          }
                        }}
                        disabled={
                          !players[currentPlayer] || 
                          !players[currentPlayer].frames ||
                          !players[currentPlayer].frames[players[currentPlayer].currentFrame] ||
                          players[currentPlayer].frames[players[currentPlayer].currentFrame]?.rolls.length !== 1 ||
                          players[currentPlayer].frames[players[currentPlayer].currentFrame]?.rolls[0]?.pins === 10
                        }
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Spare (/)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scoreboard */}
              <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
                <h3 className="text-xl font-bold text-bowling-black-900 mb-4">Marcador</h3>
                <div className="min-w-full">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 px-3">Jugador</th>
                        {Array.from({ length: 10 }, (_, i) => (
                          <th key={i} className="text-center py-2 px-2 min-w-[60px]">
                            {i + 1}
                          </th>
                        ))}
                        <th className="text-center py-2 px-3 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, playerIndex) => (
                        <tr 
                          key={player.id} 
                          className={`border-b ${currentPlayer === playerIndex && !gameFinished ? 'bg-bowling-orange-50' : ''}`}
                        >
                          <td className="py-3 px-3 font-semibold">
                            {player.name}
                            {currentPlayer === playerIndex && !gameFinished && (
                              <Target className="w-4 h-4 inline ml-2 text-bowling-orange-500" />
                            )}
                          </td>
                          {player.frames.map((frame, frameIndex) => (
                            <td key={frameIndex} className="text-center py-2 px-1">
                              <div className="text-xs space-y-1">
                                <div className="flex justify-center space-x-1">
                                  {frame.rolls && frame.rolls.map((roll, rollIndex) => (
                                    <span key={rollIndex} className="w-4 h-4 flex items-center justify-center border border-gray-300 text-xs">
                                      {roll.isStrike ? 'X' : roll.isSpare ? '/' : roll.pins}
                                    </span>
                                  ))}
                                  {frameIndex === 9 && frame.rolls.length < 3 && (frame.isStrike || frame.isSpare) && (
                                    Array.from({ length: 3 - frame.rolls.length }, (_, i) => (
                                      <span key={`empty-${i}`} className="w-4 h-4 flex items-center justify-center border border-gray-300 text-xs">
                                        -
                                      </span>
                                    ))
                                  )}
                                  {frameIndex < 9 && frame.rolls.length < 2 && !frame.isStrike && (
                                    <span className="w-4 h-4 flex items-center justify-center border border-gray-300 text-xs">
                                      -
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm font-semibold">
                                  {frame.isComplete ? calculateScore(player.frames.slice(0, frameIndex + 1)) : ''}
                                </div>
                              </div>
                            </td>
                          ))}
                          <td className="text-center py-3 px-3 font-bold text-lg">
                            {player.totalScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {gameFinished && (
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl shadow-lg p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">¡Partida Terminada!</h2>
                  <div className="text-lg">
                    🥇 Ganador: {players.reduce((winner, player) => 
                      player.totalScore > winner.totalScore ? player : winner
                    ).name} con {Math.max(...players.map(p => p.totalScore))} puntos
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
