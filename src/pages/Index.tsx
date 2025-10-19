import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const BACKEND_URL = 'https://functions.poehali.dev/470c9d53-da7c-455e-83ad-f37e1e364abf';

interface Team {
  id: number;
  name: string;
  logo_emoji: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

const Index = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ teamId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  const loadTeams = async () => {
    try {
      const response = await fetch(BACKEND_URL);
      const data = await response.json();
      setTeams(data.teams || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const updateStat = async (teamId: number, field: string, value: number) => {
    try {
      await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, field, value })
      });
      await loadTeams();
    } catch (error) {
      console.error('Error updating stat:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadTeams();
    const interval = setInterval(loadTeams, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (teamId: number, field: string, currentValue: number) => {
    setEditingCell({ teamId, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = () => {
    if (editingCell) {
      const value = parseInt(editValue) || 0;
      updateStat(editingCell.teamId, editingCell.field, value);
      setEditingCell(null);
    }
  };

  const getPositionColor = (index: number) => {
    if (index < 3) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    if (index < 6) return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
    if (index >= teams.length - 3) return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
  };

  const renderEditableCell = (team: Team, field: keyof Team, label: string) => {
    const isEditing = editingCell?.teamId === team.id && editingCell?.field === field;
    const value = team[field] as number;

    if (isEditing) {
      return (
        <Input
          autoFocus
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') setEditingCell(null);
          }}
          className="w-16 h-8 text-center"
        />
      );
    }

    return (
      <span
        onClick={() => handleCellClick(team.id, field, value)}
        className="cursor-pointer hover:bg-purple-100 px-2 py-1 rounded transition-colors"
      >
        {value}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <p className="text-xl text-muted-foreground">Загрузка турнирной таблицы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-6xl">⚽</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              ЛДЛ
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">Любительская Дивизионная Лига</p>
          <p className="text-sm text-muted-foreground">Кликните на цифры для редактирования</p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-2 border-purple-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="p-4 text-left font-bold">#</th>
                  <th className="p-4 text-left font-bold">Команда</th>
                  <th className="p-4 text-center font-bold">И</th>
                  <th className="p-4 text-center font-bold">В</th>
                  <th className="p-4 text-center font-bold">Н</th>
                  <th className="p-4 text-center font-bold">П</th>
                  <th className="p-4 text-center font-bold">Забито</th>
                  <th className="p-4 text-center font-bold">Пропущено</th>
                  <th className="p-4 text-center font-bold">Разница</th>
                  <th className="p-4 text-center font-bold">Очки</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr
                    key={team.id}
                    className="border-b border-purple-100 hover:bg-purple-50 transition-all"
                  >
                    <td className="p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getPositionColor(index)}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{team.logo_emoji}</span>
                        <span className="font-semibold text-lg" style={{ color: team.color }}>
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-semibold">
                      {renderEditableCell(team, 'played', 'Игры')}
                    </td>
                    <td className="p-4 text-center font-semibold text-green-600">
                      {renderEditableCell(team, 'won', 'Победы')}
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-600">
                      {renderEditableCell(team, 'drawn', 'Ничьи')}
                    </td>
                    <td className="p-4 text-center font-semibold text-red-600">
                      {renderEditableCell(team, 'lost', 'Поражения')}
                    </td>
                    <td className="p-4 text-center font-semibold text-blue-600">
                      {renderEditableCell(team, 'goals_for', 'Забито')}
                    </td>
                    <td className="p-4 text-center font-semibold text-orange-600">
                      {renderEditableCell(team, 'goals_against', 'Пропущено')}
                    </td>
                    <td className={`p-4 text-center font-bold ${team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg px-4 py-2 rounded-lg shadow-lg">
                        {renderEditableCell(team, 'points', 'Очки')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 border-green-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <div>
                <p className="font-semibold text-green-800">Топ-3</p>
                <p className="text-sm text-green-600">Лидеры турнира</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"></div>
              <div>
                <p className="font-semibold text-blue-800">4-6 место</p>
                <p className="text-sm text-blue-600">Средняя группа</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-100 to-rose-100 border-red-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-rose-600"></div>
              <div>
                <p className="font-semibold text-red-800">Последние 3</p>
                <p className="text-sm text-red-600">Зона вылета</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Данные обновляются автоматически каждые 5 секунд
        </div>
      </div>
    </div>
  );
};

export default Index;
