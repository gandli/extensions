import { useLocalStorage } from '@raycast/utils';
import { Gradient } from '../types';

export interface GradientPreset {
  name: string;
  colors: string[];
  description?: string;
}

export const defaultPresets: GradientPreset[] = [
  {
    name: 'Sunset',
    colors: ['#EE7752', '#E73C7E', '#23A6D5'],
    description: 'Warm sunset colors transitioning from orange to pink to blue',
  },
  {
    name: 'Ocean',
    colors: ['#0B486B', '#F56217'],
    description: 'Deep ocean blue to warm orange',
  },
  {
    name: 'Forest',
    colors: ['#5A3F37', '#2C7744'],
    description: 'Rich brown to forest green',
  },
  {
    name: 'Aurora',
    colors: ['#9CECFB', '#65C7F7', '#0052D4'],
    description: 'Northern lights inspired blues',
  },
  {
    name: 'Candy',
    colors: ['#FBD3E9', '#BB377D'],
    description: 'Soft pink to deep magenta',
  },
  {
    name: 'Midnight',
    colors: ['#0F0F23', '#1E1E3F', '#2D2D5F'],
    description: 'Dark midnight blues',
  },
  {
    name: 'Sunrise',
    colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
    description: 'Bright sunrise with yellow and teal',
  },
  {
    name: 'Autumn',
    colors: ['#D2691E', '#CD853F', '#F4A460'],
    description: 'Warm autumn earth tones',
  },
  {
    name: 'Spring',
    colors: ['#98FB98', '#90EE90', '#32CD32'],
    description: 'Fresh spring greens',
  },
  {
    name: 'Neon',
    colors: ['#FF1493', '#00FF00', '#00BFFF'],
    description: 'Vibrant neon colors',
  },
  {
    name: 'Pastel',
    colors: ['#FFB6C1', '#DDA0DD', '#87CEEB'],
    description: 'Soft pastel colors',
  },
  {
    name: 'Fire',
    colors: ['#FF4500', '#FF6347', '#FF8C00'],
    description: 'Hot fire oranges and reds',
  },
  {
    name: 'Ice',
    colors: ['#F0F8FF', '#E6E6FA', '#B0E0E6'],
    description: 'Cool ice blues and whites',
  },
  {
    name: 'Desert',
    colors: ['#DEB887', '#F4A460', '#D2B48C'],
    description: 'Warm desert sand tones',
  },
  {
    name: 'Twilight',
    colors: ['#4B0082', '#8A2BE2', '#9370DB'],
    description: 'Deep purple twilight colors',
  },
];

export const usePresets = () => {
  const { value: savedGradients, isLoading } = useLocalStorage<Gradient[]>('saved-gradients', []);

  const allPresets = [...defaultPresets];

  (savedGradients || []).forEach((g) => {
    let name = g.label || (g.type === 'linear' ? `${g.type} (${g.angle ?? 90}°)` : g.type);

    // Ensure unique name by appending suffix if needed
    let uniqueName = name;
    let counter = 1;
    // Check against existing presets (both defaults and previously processed saved ones)
    while (allPresets.some((p) => p.name === uniqueName)) {
      uniqueName = `${name} (${counter})`;
      counter++;
    }

    // If it collided with a default preset but didn't have (User), we might want to add (User) to be clear?
    // But the loop above handles uniqueness.
    // If "Sunset" exists, and user has "Sunset", it becomes "Sunset (1)".
    // Maybe "Sunset (User)" is better than "Sunset (1)".

    // Let's refine the logic slightly:
    // If exact match with default, try appending (User).
    // Then checks for uniqueness.

    if (defaultPresets.some(p => p.name === name)) {
        uniqueName = `${name} (User)`;
        // Re-check uniqueness for the new name
        counter = 1;
        const baseName = uniqueName;
        while (allPresets.some((p) => p.name === uniqueName)) {
            uniqueName = `${baseName} ${counter}`;
            counter++;
        }
    } else {
        // Just check normal collisions
        counter = 1;
        while (allPresets.some((p) => p.name === uniqueName)) {
             uniqueName = `${name} (${counter})`;
             counter++;
        }
    }

    allPresets.push({
      name: uniqueName,
      colors: g.stops,
      description: 'User saved gradient',
    });
  });

  return { presets: allPresets, isLoading };
};

// Function to add a new preset (for future user customization)
export const addPreset = (preset: GradientPreset): void => {
  // TODO: In future updates, save to user storage
  console.log('Adding preset:', preset);
};

// Function to remove a preset (for future user customization)
export const removePreset = (presetName: string): void => {
  // TODO: In future updates, remove from user storage
  console.log('Removing preset:', presetName);
};
