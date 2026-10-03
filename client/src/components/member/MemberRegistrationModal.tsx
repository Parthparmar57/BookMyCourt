import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { memberApi } from '../../services/api';
import { useToast } from '../ui/Toast';
import { MembershipTier } from '../../types';

export interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1995-06-15');
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier>('Gold');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAge = (dobString: string): number => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      showError('Please fill in all mandatory fields.');
      return;
    }

    // Business Rule BR6: Junior plan strictly < 18 years
    const age = calculateAge(dob);
    if (selectedPlan === 'Junior' && age >= 18) {
      showError('Junior Plan Validation Failed', 'Junior Plan is strictly available only for members under 18 years of age.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await memberApi.createMember({
        name,
        phone,
        email,
        dateOfBirth: dob,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        planId: selectedPlan === 'Gold' ? 'plan-gold' : selectedPlan === 'Silver' ? 'plan-silver' : 'plan-junior',
        planName: selectedPlan,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: 'active',
        emergencyContact: {
          name: emergencyName || 'Family Member',
          phone: emergencyPhone || phone
        }
      });

      showSuccess('Member Registered Successfully!', `Assigned Member ID: ${created.memberId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showError('Registration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Club Member" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            placeholder="e.g. Vikram Malhotra"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Phone Number *"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email Address *"
            type="email"
            placeholder="vikram@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Date of Birth *"
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
          />
        </div>

        {/* Plan Tier Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Select Membership Tier *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Gold', 'Silver', 'Junior'] as MembershipTier[]).map(plan => (
              <button
                key={plan}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`py-2.5 px-3 rounded-md text-xs font-bold border text-center transition-all ${
                  selectedPlan === plan
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white text-text-secondary hover:border-border-strong'
                }`}
              >
                <div>{plan} Tier</div>
                <div className="text-[10px] font-normal text-text-muted mt-0.5">
                  {plan === 'Gold' ? '100% Free Courts' : plan === 'Silver' ? '50% Off Courts' : 'Under 18 Only'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Input
            label="Emergency Contact Name"
            placeholder="e.g. Sunita Malhotra"
            value={emergencyName}
            onChange={e => setEmergencyName(e.target.value)}
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="+91 98765 43211"
            value={emergencyPhone}
            onChange={e => setEmergencyPhone(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Register & Generate Digital ID
          </Button>
        </div>
      </form>
    </Modal>
  );
};
