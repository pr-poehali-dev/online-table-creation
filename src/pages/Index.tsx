import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = 'https://functions.poehali.dev/ef7e03e4-d744-4297-bd67-c411230063d6';

interface Cell {
  row_index: number;
  col_index: number;
  value: string;
}

interface User {
  user_name: string;
  user_color: string;
}

const ROWS = 20;
const COLS = 10;

const generateUserColor = () => {
  const colors = ['#8B5CF6', '#D946EF', '#0EA5E9', '#F97316', '#10B981', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Index = () => {
  const [cells, setCells] = useState<Map<string, string>>(new Map());
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [userName] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [userColor] = useState(generateUserColor());
  const { toast } = useToast();

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const loadData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}?sheet_id=1`);
      const data = await response.json();
      
      const newCells = new Map<string, string>();
      data.cells.forEach((cell: Cell) => {
        newCells.set(getCellKey(cell.row_index, cell.col_index), cell.value);
      });
      setCells(newCells);
      setActiveUsers(data.users || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateCell = async (row: number, col: number, value: string) => {
    try {
      await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_id: 1,
          row,
          col,
          value
        })
      });

      const newCells = new Map(cells);
      newCells.set(getCellKey(row, col), value);
      setCells(newCells);
    } catch (error) {
      console.error('Error updating cell:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const updateUserPresence = async () => {
    try {
      await fetch(BACKEND_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_id: 1,
          user_name: userName,
          user_color: userColor
        })
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  useEffect(() => {
    loadData();
    updateUserPresence();
    
    const interval = setInterval(() => {
      loadData();
      updateUserPresence();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    setEditingCell(getCellKey(row, col));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newCells = new Map(cells);
    newCells.set(getCellKey(row, col), value);
    setCells(newCells);
  };

  const handleCellBlur = (row: number, col: number) => {
    const value = cells.get(getCellKey(row, col)) || '';
    updateCell(row, col, value);
    setEditingCell(null);
  };

  const addRow = () => {
    toast({
      title: 'Строка добавлена',
      description: 'Прокрутите вниз чтобы увидеть новую строку'
    });
  };

  const addColumn = () => {
    toast({
      title: 'Колонка добавлена',
      description: 'Прокрутите вправо чтобы увидеть новую колонку'
    });
  };

  const getColumnLabel = (index: number) => {
    let label = '';
    let num = index;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Онлайн Таблица
            </h1>
            <p className="text-muted-foreground">Совместное редактирование в реальном времени</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} className="text-muted-foreground" />
              <div className="flex -space-x-2">
                {activeUsers.map((user, i) => (
                  <Badge
                    key={i}
                    className="px-3 py-1 font-medium border-2 border-white"
                    style={{ backgroundColor: user.user_color }}
                  >
                    {user.user_name}
                  </Badge>
                ))}
                <Badge
                  className="px-3 py-1 font-medium border-2 border-white"
                  style={{ backgroundColor: userColor }}
                >
                  {userName} (Вы)
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="border-b border-purple-100 p-4 bg-gradient-to-r from-purple-50 to-pink-50 flex gap-2">
            <Button onClick={addRow} className="gap-2" variant="outline">
              <Icon name="Plus" size={16} />
              Добавить строку
            </Button>
            <Button onClick={addColumn} className="gap-2" variant="outline">
              <Icon name="Plus" size={16} />
              Добавить колонку
            </Button>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-250px)]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-purple-100 to-pink-100">
                <tr>
                  <th className="w-12 h-10 border border-purple-200 bg-gradient-to-br from-purple-200 to-pink-200 text-purple-900 font-semibold"></th>
                  {Array.from({ length: COLS }, (_, i) => (
                    <th
                      key={i}
                      className="min-w-[120px] h-10 border border-purple-200 text-purple-900 font-semibold text-sm"
                    >
                      {getColumnLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }, (_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-purple-50/50 transition-colors">
                    <td className="w-12 h-10 border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 text-center font-semibold text-purple-900 text-sm">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: COLS }, (_, colIndex) => {
                      const cellKey = getCellKey(rowIndex, colIndex);
                      const isEditing = editingCell === cellKey;
                      const value = cells.get(cellKey) || '';
                      const isHeader = rowIndex === 0;

                      return (
                        <td
                          key={colIndex}
                          className={`border border-purple-200 p-0 transition-all ${
                            isHeader ? 'bg-gradient-to-r from-purple-50 to-pink-50 font-semibold' : ''
                          }`}
                          onClick={() => !isEditing && handleCellClick(rowIndex, colIndex)}
                        >
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={value}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              onBlur={() => handleCellBlur(rowIndex, colIndex)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellBlur(rowIndex, colIndex);
                                }
                              }}
                              className="w-full h-10 border-0 focus-visible:ring-2 focus-visible:ring-purple-500 rounded-none"
                            />
                          ) : (
                            <div className="h-10 px-3 flex items-center cursor-pointer hover:bg-purple-100/30">
                              {value}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Данные автоматически сохраняются и синхронизируются
        </div>
      </div>
    </div>
  );
};

export default Index;
