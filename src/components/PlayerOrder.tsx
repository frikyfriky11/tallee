import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../types';

interface SortableItemProps {
  player: Player;
  index: number;
}

function SortableItem({ player, index }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white dark:bg-slate-800 border rounded-xl px-4 py-3.5 transition-colors ${
        isDragging ? 'border-violet-500 shadow-lg shadow-violet-500/20 opacity-90' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <span className="text-slate-400 dark:text-slate-500 text-sm w-5 text-center font-mono">{index + 1}</span>
      <span className="flex-1 text-slate-900 dark:text-white font-medium">{player.name}</span>
      <button
        className="touch-none text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 4a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm6-14a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
}

interface Props {
  players: Player[];
  onConfirm: (players: Player[]) => void;
  onBack: () => void;
  onReset: () => void;
}

export function PlayerOrder({ players: initialPlayers, onConfirm, onBack, onReset }: Props) {
  const [players, setPlayers] = useState(initialPlayers);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlayers((items) => {
        const oldIndex = items.findIndex((p) => p.id === active.id);
        const newIndex = items.findIndex((p) => p.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Tallee</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Arrange players in playing order</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {players.map((player, index) => (
              <SortableItem key={player.id} player={player} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-slate-400 dark:text-slate-500 text-xs text-center">
        Drag the handle to set the turn order
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onConfirm(players)}
          className="flex-2 flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
        >
          Start Game →
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors"
      >
        Cancel &amp; start over
      </button>
    </div>
  );
}
