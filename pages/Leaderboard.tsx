// Leaderboard page displaying top users with points
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy } from "lucide-react";

interface LeaderboardUser {
    userId: string;
    userName: string;
    totalPoints: number;
    rank: number;
    competitionsParticipated: number;
    bestRank: number;
}

export default function Leaderboard() {
    const { data: leaderboard = [], isLoading } = trpc.leaderboard.getTopUsers.useQuery();

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                        <h1 className="text-4xl md:text-5xl font-bold text-green-700">لوحة المتصدرين</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">أفضل المشاركين في المسابقات والفعاليات</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                    </div>
                ) : leaderboard.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-lg text-muted-foreground">لا توجد بيانات للتصنيف حالياً</p>
                        <p className="text-sm text-muted-foreground mt-2">شارك في المسابقات لتظهر في لوحة المتصدرين!</p>
                    </Card>
                ) : (
                    <>
                        {/* Top 3 Podium - Side by Side */}
                        {top3.length > 0 && (
                            <div className="mb-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    {/* 2nd Place */}
                                    {top3[1] && (
                                        <div className="md:order-1 order-2">
                                            <Card className="p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-400 hover:shadow-lg transition">
                                                <div className="text-5xl mb-2">🥈</div>
                                                <h3 className="text-xl font-bold text-foreground mb-2">{top3[1].userName}</h3>
                                                <div className="text-3xl font-bold text-gray-600 mb-3">
                                                    {top3[1].totalPoints}<span className="text-sm text-muted-foreground mr-1">نقطة</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>🏆 {top3[1].competitionsParticipated} مسابقة</p>
                                                    {top3[1].bestRank !== 999 && <p>⭐ أفضل مركز: #{top3[1].bestRank}</p>}
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                    {/* 1st Place */}
                                    {top3[0] && (
                                        <div className="md:order-2 order-1">
                                            <Card className="p-8 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-4 border-yellow-400 hover:shadow-2xl transition transform md:scale-110">
                                                <div className="text-6xl mb-3">🥇</div>
                                                <h3 className="text-2xl font-bold text-foreground mb-2">{top3[0].userName}</h3>
                                                <div className="text-4xl font-bold text-yellow-600 mb-4">
                                                    {top3[0].totalPoints}<span className="text-sm text-muted-foreground mr-1">نقطة</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>🏆 {top3[0].competitionsParticipated} مسابقة</p>
                                                    {top3[0].bestRank !== 999 && <p>⭐ أفضل مركز: #{top3[0].bestRank}</p>}
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                    {/* 3rd Place */}
                                    {top3[2] && (
                                        <div className="md:order-3 order-3">
                                            <Card className="p-6 text-center bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-600 hover:shadow-lg transition">
                                                <div className="text-5xl mb-2">🥉</div>
                                                <h3 className="text-xl font-bold text-foreground mb-2">{top3[2].userName}</h3>
                                                <div className="text-3xl font-bold text-amber-700 mb-3">
                                                    {top3[2].totalPoints}<span className="text-sm text-muted-foreground mr-1">نقطة</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>🏆 {top3[2].competitionsParticipated} مسابقة</p>
                                                    {top3[2].bestRank !== 999 && <p>⭐ أفضل مركز: #{top3[2].bestRank}</p>}
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rest of Rankings */}
                        {rest.length > 0 && (
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">بقية المتصدرين</h2>
                                <div className="space-y-3">
                                    {rest.map((user: LeaderboardUser) => (
                                        <Card key={user.userId} className="p-4 hover:shadow-md transition">
                                            <div className="flex items-center gap-4">
                                                {/* Rank */}
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-green-700">{getRankBadge(user.rank)}</span>
                                                </div>
                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-foreground truncate">{user.userName}</h3>
                                                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                                        <span>🏆 {user.competitionsParticipated} مسابقة</span>
                                                        {user.bestRank !== 999 && <span>⭐ أفضل: #{user.bestRank}</span>}
                                                    </div>
                                                </div>
                                                {/* Points */}
                                                <div className="text-left">
                                                    <div className="text-2xl font-bold text-green-600">{user.totalPoints}</div>
                                                    <div className="text-xs text-muted-foreground">نقطة</div>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-l from-green-500 to-green-600 h-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min((user.totalPoints / (top3[0]?.totalPoints || 100)) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Info Section */}
                <Card className="max-w-3xl mx-auto mt-12 p-6 bg-green-50 border-green-200">
                    <h3 className="text-lg font-bold text-foreground mb-3">📊 كيف يتم حساب النقاط؟</h3>
                    <div className="space-y-2 text-sm text-foreground">
                        <p>🥇 <strong>المركز الأول:</strong> 100 نقطة</p>
                        <p>🥈 <strong>المركز الثاني:</strong> 75 نقطة</p>
                        <p>🥉 <strong>المركز الثالث:</strong> 50 نقطة</p>
                        <p>📝 <strong>المشاركة في المسابقة:</strong> 20 نقطة</p>
                        <p>🎉 <strong> الحضور في الورش:</strong> 20 نقطة</p>
                    </div>
                </Card>
            </main>
        </div>
    );
}
