import React from 'react';
import { BookingSlot, SportType, SlotStatus } from '../../types';
import { cn } from '../../utils/cn';
import { Clock, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface BookingGridProps {
  slots: BookingSlot[];
  onSelectSlot: (slot: BookingSlot) => void;
  selectedSlotId?: string;
}

export const BookingGrid: React.FC<BookingGridProps> = ({
  slots,
  onSelectSlot,
  selectedSlotId
}) => {
  // Group slots by Court Name
  const courtNames = Array.from(new Set(slots.map(s => s.courtName)));
  const timeBlocks = Array.from(new Set(slots.map(s => s.startTime))).sort();

  const getSlotStyle = (status: SlotStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-primary text-white border-primary shadow-md scale-[1.02] ring-2 ring-primary ring-offset-1 font-bold';
    }
    switch (status) {
      case 'available':
        return 'bg-surface text-primary border-border hover:border-primary hover:bg-primary/5 cursor-pointer font-semibold';
      case 'booked':
        return 'bg-surface-muted text-text-muted border-border/60 cursor-not-allowed opacity-80';
      case 'social_play':
        return 'bg-accent-muted text-foreground border-accent/60 hover:border-accent cursor-pointer font-bold';
      case 'maintenance':
        return 'bg-surface-muted text-text-muted border-border cursor-not-allowed opacity-40 repeating-linear-gradient';
      case 'disabled':
        return 'bg-surface-muted text-text-muted border-border cursor-not-allowed opacity-50';
      default:
        return 'bg-surface text-foreground';
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-white shadow-xs">
      <table className="w-full border-collapse min-w-[800px]">
        {/* Table Header: Time Blocks */}
        <thead>
          <tr className="border-b border-border bg-surface/80">
            <th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted sticky left-0 bg-surface/90 z-10 w-44 border-r border-border">
              Court / Sport
            </th>
            {timeBlocks.map(time => (
              <th key={time} className="p-3 text-center text-xs font-semibold text-text-secondary border-r border-border/60 min-w-[110px]">
                <div className="flex items-center justify-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-text-muted" />
                  <span>{time}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body: Court Rows */}
        <tbody className="divide-y divide-border/60">
          {courtNames.map(courtName => {
            const firstSlot = slots.find(s => s.courtName === courtName);
            const sport = firstSlot?.sport || 'Tennis';

            return (
              <tr key={courtName} className="hover:bg-surface/30 transition-colors">
                {/* Court Name Header */}
                <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="font-bold text-sm text-foreground">{courtName}</div>
                  <div className="text-[11px] font-medium text-text-muted flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    <span>{sport}</span>
                  </div>
                </td>

                {/* Slots Cells */}
                {timeBlocks.map(time => {
                  const slot = slots.find(s => s.courtName === courtName && s.startTime === time);
                  if (!slot) return <td key={time} className="p-2 border-r border-border/40 bg-surface-muted/20" />;

                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <td key={time} className="p-1.5 border-r border-border/40 text-center align-middle">
                      <div
                        onClick={() => {
                          if (slot.status === 'available' || slot.status === 'social_play') {
                            onSelectSlot(slot);
                          }
                        }}
                        className={cn(
                          'p-2 rounded-md border text-xs transition-all duration-150 flex flex-col items-center justify-center min-h-[54px]',
                          getSlotStyle(slot.status, isSelected)
                        )}
                      >
                        {slot.status === 'available' && (
                          <>
                            <span className="text-[10px] text-text-muted uppercase">60 min</span>
                            <span className="font-bold text-primary text-xs">₹{slot.price}</span>
                          </>
                        )}

                        {slot.status === 'booked' && (
                          <>
                            <span className="font-bold text-[11px] truncate max-w-[90px]">{slot.memberName || 'Booked'}</span>
                            <span className="text-[10px] text-text-muted">Reserved</span>
                          </>
                        )}

                        {slot.status === 'social_play' && (
                          <>
                            <div className="flex items-center gap-1 text-[10px] text-primary font-extrabold uppercase">
                              <Users className="w-3 h-3" />
                              <span>Social Play</span>
                            </div>
                            <span className="text-[11px] font-mono mt-0.5">{slot.currentPlayers}/{slot.maxPlayers} Joined</span>
                          </>
                        )}

                        {slot.status === 'maintenance' && (
                          <span className="text-[10px] font-semibold text-text-muted uppercase">Closed</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
