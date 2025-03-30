import React, { useState, useEffect } from "react";
import { useGame } from "../../contexts/GameContext";
import { formatCurrency } from "../../utils/format";

export function TournamentResult({ result, onClose }) {
    const { gameState, updateGameState } = useGame();
    const [stats, setStats] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        // 최근 100경기 통계 가져오기
        const recentStats = gameState.tournament.logger.getRecentStats(100);
        setStats(recentStats);
    }, [gameState.tournament.logger]);

    const handleResetStats = () => {
        gameState.tournament.logger.resetStats();
        // 통계 새로고침
        const recentStats = gameState.tournament.logger.getRecentStats(100);
        setStats(recentStats);
        setShowResetConfirm(false);
    };

    if (!result) return null;

    const getRankColor = (rank) => {
        if (rank === 1) return "text-yellow-400";
        if (rank === 2) return "text-gray-400";
        if (rank === 3) return "text-amber-700";
        return "text-gray-600";
    };

    const getPrizeColor = (prize) => {
        if (prize > 0) return "text-green-600";
        return "text-red-600";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        토너먼트 결과
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            통계 초기화
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 초기화 확인 대화상자 */}
                {showResetConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                통계 초기화 확인
                            </h3>
                            <p className="text-gray-600 mb-6">
                                정말로 모든 토너먼트 통계를 초기화하시겠습니까?
                                이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleResetStats}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 현재 결과 */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">현재 결과</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">순위</p>
                            <p
                                className={`text-2xl font-bold ${getRankColor(
                                    result.rank
                                )}`}
                            >
                                {result.rank}위
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600">획득 상금</p>
                            <div className="h-20 flex flex-col justify-between">
                                <p
                                    className={`text-4xl font-bold ${getPrizeColor(
                                        result.prize
                                    )}`}
                                >
                                    {formatCurrency(result.prize)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {result.isInMoney
                                        ? "상금 지급 완료"
                                        : "상금 미지급"}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600">점수</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {result.score}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 최근 100경기 통계 */}
                {stats && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            최근 100경기 통계
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">총 참가 경기</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {stats.totalTournaments}경기
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">총 상금</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.totalPrize)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">총 수익</p>
                                <p
                                    className={`text-2xl font-bold ${getPrizeColor(
                                        stats.totalProfit
                                    )}`}
                                >
                                    {formatCurrency(stats.totalProfit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">평균 순위</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.averageRank.toFixed(1)}위
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">최고 순위</p>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {stats.bestRank}위
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">최저 순위</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.worstRank}위
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">
                                    파이널 테이블 진출
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.finalTableCount}회
                                </p>
                                <p className="text-sm text-gray-500">
                                    (
                                    {(
                                        (stats.finalTableCount /
                                            stats.totalTournaments) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">상금 지급 횟수</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.inMoneyCount}회
                                </p>
                                <p className="text-sm text-gray-500">
                                    (
                                    {(
                                        (stats.inMoneyCount /
                                            stats.totalTournaments) *
                                        100
                                    ).toFixed(2)}
                                    %)
                                </p>
                            </div>
                        </div>

                        {/* 토너먼트 타입별 통계 */}
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-3">
                                토너먼트 타입별 통계
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(stats.byType).map(
                                    ([type, typeStats]) => (
                                        <div
                                            key={type}
                                            className="bg-gray-50 p-3 rounded"
                                        >
                                            <p className="text-gray-600 capitalize">
                                                {type}
                                            </p>
                                            <p className="text-lg font-bold">
                                                {typeStats.count}회
                                            </p>
                                            <p className="text-sm text-green-600">
                                                {formatCurrency(
                                                    typeStats.totalPrize
                                                )}
                                            </p>
                                            <p className="text-sm text-red-600">
                                                -
                                                {formatCurrency(
                                                    typeStats.totalBuyIn
                                                )}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
