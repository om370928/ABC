import type { RankedEvent, SocialPost } from '@/lib/national-day-calendar/types';

type VisualCategory = {
  keywords: string[];
  direction: (eventName: string) => string;
};

const VISUAL_CATEGORIES: VisualCategory[] = [
  {
    keywords: ['chocolate', 'coffee', 'pizza', 'ice cream', 'donut', 'donut', 'cookie',
      'cheese', 'burger', 'beer', 'wine', 'taco', 'bagel', 'pie', 'cake', 'bbq',
      'steak', 'pancake', 'chicken', 'pasta', 'sandwich', 'nachos', 'chili', 'salsa',
      'guacamole', 'margarita', 'martini', 'whiskey', 'food', 'eat', 'cook', 'bake',
      'sugar', 'candy', 'snack', 'breakfast', 'lunch', 'dinner', 'dessert', 'drink',
      'tea', 'water', 'soda', 'juice', 'smoothie', 'cocktail', 'appetizer', 'soup',
      'salad', 'seafood', 'shrimp', 'lobster', 'crab', 'fish'],
    direction: (name) =>
      `A beautiful, appetizing, photorealistic hero image of ${name.toLowerCase()} as the centerpiece. ` +
      `Show the food or beverage in an editorial-quality, professionally styled composition with natural lighting, ` +
      `shallow depth of field, and a clean neutral background. The dish should look fresh, vibrant, and mouth-watering, ` +
      `presented as if for a premium food magazine cover.`,
  },
  {
    keywords: ['dog', 'cat', 'puppy', 'kitten', 'animal', 'pet', 'horse', 'bird',
      'wildlife', 'elephant', 'dolphin', 'whale', 'turtle', 'rabbit', 'hamster'],
    direction: (name) =>
      `A warm, authentic, photorealistic hero image celebrating ${name.toLowerCase()}. ` +
      `Show the animal in a natural, candid moment with genuine emotion — a dog playing, a cat lounging, ` +
      `or the relevant animal in its element. Use soft natural lighting, shallow depth of field, ` +
      `and a clean composition that feels editorial and heartwarming.`,
  },
  {
    keywords: ['football', 'baseball', 'basketball', 'soccer', 'hockey', 'tennis',
      'golf', 'run', 'walk', 'fitness', 'yoga', 'swim', 'bike', 'sport', 'athlete'],
    direction: (name) =>
      `An energetic, authentic sports hero image related to ${name.toLowerCase()}. ` +
      `Show real athletes in action with dynamic movement, professional stadium or outdoor lighting, ` +
      `and a sense of passion and competition. The composition should feel editorial and powerful, ` +
      `suitable for a premium sports publication.`,
  },
  {
    keywords: ['veterans', 'memorial', 'military', 'soldier', 'police', 'fire',
      'nurse', 'doctor', 'teacher', 'first responder', 'service'],
    direction: (name) =>
      `A respectful, dignified hero image honoring ${name.toLowerCase()}. ` +
      `Show authentic professionals in their work environment — a nurse caring for a patient, ` +
      `a firefighter in gear, a teacher with students, or service members in formation. ` +
      `Use warm, sincere lighting with an editorial documentary quality that conveys respect and gratitude.`,
  },
  {
    keywords: ['halloween', 'christmas', 'thanksgiving', 'valentine', 'easter',
      'new year', 'independence', 'fourth of july', 'st patrick', 'holiday'],
    direction: (name) =>
      `A festive, atmospheric hero image celebrating ${name.toLowerCase()}. ` +
      `Capture the holiday spirit with seasonal decor, warm lighting, and authentic celebration imagery. ` +
      `The scene should feel premium and editorial — like a high-end holiday magazine cover — ` +
      `not generic clip art or cartoonish decoration.`,
  },
  {
    keywords: ['space', 'moon', 'sun', 'star', 'planet', 'nasa', 'astronomy'],
    direction: (name) =>
      `A breathtaking, photorealistic hero image of space or astronomy related to ${name.toLowerCase()}. ` +
      `Use a stunning cosmic visual — a galaxy, nebula, planet, or the moon — with rich deep-space colors, ` +
      `dramatic contrast, and a sense of wonder. The composition should feel like a NASA-quality editorial photograph.`,
  },
  {
    keywords: ['nature', 'environment', 'ocean', 'river', 'mountain', 'forest',
      'tree', 'flower', 'garden', 'plant', 'earth', 'climate', 'recycle', 'sustainability'],
    direction: (name) =>
      `A stunning, photorealistic nature hero image related to ${name.toLowerCase()}. ` +
      `Show a beautiful natural landscape — a pristine ocean, forest, mountain range, or garden — ` +
      `with golden-hour lighting, rich natural colors, and a sense of serenity and environmental beauty. ` +
      `The composition should be editorial-quality, like a National Geographic photograph.`,
  },
  {
    keywords: ['art', 'music', 'dance', 'book', 'reading', 'photography', 'paint',
      'write', 'poetry', 'creative'],
    direction: (name) =>
      `An inspiring, artistic hero image related to ${name.toLowerCase()}. ` +
      `Show authentic creative expression — a painter at work, a musician performing, ` +
      `shelves of books, or a photography studio — with warm, creative lighting and an editorial ` +
      `composition that celebrates human creativity and culture.`,
  },
  {
    keywords: ['health', 'awareness', 'mental', 'cancer', 'diabetes', 'heart',
      'wellness', 'mindfulness', 'meditation'],
    direction: (name) =>
      `A thoughtful, respectful hero image for ${name.toLowerCase()}. ` +
      `Use a meaningful visual that represents awareness and wellness — a person meditating, ` +
      `a symbolic ribbon, hands joined in solidarity, or a serene wellness scene. ` +
      `The tone should be compassionate, hopeful, and editorial-quality, not clinical or generic.`,
  },
  {
    keywords: ['history', 'heritage', 'cultural', 'culture', 'indigenous', 'black history',
      'women', 'pride', 'juneteenth', 'martin luther'],
    direction: (name) =>
      `A meaningful, culturally rich hero image for ${name.toLowerCase()}. ` +
      `Use authentic cultural or historical imagery — a significant historical moment, ` +
      `cultural celebration, or symbolic representation — with dignified, editorial-quality ` +
      `composition that honors the heritage and tells a visual story.`,
  },
  {
    keywords: ['small business', 'entrepreneur', 'volunteer', 'community', 'charity',
      'kindness', 'giving', 'friendship', 'family'],
    direction: (name) =>
      `A warm, authentic hero image celebrating ${name.toLowerCase()}. ` +
      `Show genuine human connection — people working together, a small business owner, ` +
      `volunteers in action, or a family moment — with natural lighting and an editorial ` +
      `composition that feels sincere and uplifting.`,
  },
];

function determineVisualDirection(eventName: string): string {
  const lowerName = eventName.toLowerCase();

  for (const category of VISUAL_CATEGORIES) {
    const matched = category.keywords.some((kw) => lowerName.includes(kw));
    if (matched) {
      return category.direction(eventName);
    }
  }

  return (
    `A premium, editorial-quality hero image that directly represents ${eventName.toLowerCase()}. ` +
    `The visual should clearly communicate the subject of the observance with an authentic, ` +
    `photorealistic composition. Use professional lighting, shallow depth of field, and a clean ` +
    `neutral background. The artwork should feel art-directed and sophisticated, not generic or random.`
  );
}

function generateHeadline(eventName: string): string {
  const cleaned = eventName.replace(/^National\s+/i, '').replace(/^International\s+/i, '').replace(/^World\s+/i, '');

  if (/day$/i.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

function generateTagline(eventName: string): string {
  const lower = eventName.toLowerCase();

  if (lower.includes('chocolate')) return 'A little sweetness goes a long way.';
  if (lower.includes('coffee')) return 'Start the day right.';
  if (lower.includes('pizza')) return 'Everyone\'s favorite slice.';
  if (lower.includes('ice cream')) return 'Cool treats, sweet memories.';
  if (lower.includes('donut') || lower.includes('doughnut')) return 'Glazed, filled, and irresistible.';
  if (lower.includes('dog')) return 'Best friends deserve a day.';
  if (lower.includes('cat')) return 'Feline fans, this one\'s for you.';
  if (lower.includes('veterans')) return 'Honoring those who served.';
  if (lower.includes('memorial')) return 'We remember and we honor.';
  if (lower.includes('mother')) return 'Celebrating the heart of every family.';
  if (lower.includes('father')) return 'Cheers to the ones who guide us.';
  if (lower.includes('teacher')) return 'Shaping minds, changing lives.';
  if (lower.includes('nurse')) return 'Compassion in action.';
  if (lower.includes('halloween')) return 'Spooky season is here.';
  if (lower.includes('thanksgiving')) return 'Gratitude around the table.';
  if (lower.includes('christmas')) return 'Warmth, wonder, and togetherness.';
  if (lower.includes('valentine')) return 'Celebrate the people you love.';
  if (lower.includes('independence') || lower.includes('fourth of july')) return 'Land of the free, home of the brave.';
  if (lower.includes('earth')) return 'Our planet, our responsibility.';
  if (lower.includes('pizza')) return 'Everyone\'s favorite slice.';
  if (lower.includes('cheese')) return 'Grate things deserve celebration.';
  if (lower.includes('beer')) return 'Raise a glass to good taste.';
  if (lower.includes('wine')) return 'Sip, savor, and celebrate.';
  if (lower.includes('book')) return 'Every page opens a new world.';
  if (lower.includes('music')) return 'Where words fail, music speaks.';
  if (lower.includes('smile') || lower.includes('happiness') || lower.includes('happy')) return 'A reason to smile today.';
  if (lower.includes('friendship') || lower.includes('friend')) return 'Good friends make every day better.';
  if (lower.includes('volunteer') || lower.includes('kindness') || lower.includes('giving')) return 'Small acts, big impact.';

  return 'A day worth celebrating.';
}

function generateSupportingText(eventName: string, dateStr: string): string {
  const lower = eventName.toLowerCase();
  const formattedDate = formatDateForDisplay(dateStr);

  if (lower.includes('veterans') || lower.includes('memorial')) {
    return `Today we honor and remember those who served — join the nation in expressing gratitude on ${formattedDate}.`;
  }
  if (lower.includes('mother')) {
    return `Celebrate the moms and mother figures who shape our lives on ${formattedDate}.`;
  }
  if (lower.includes('father')) {
    return `Recognize the dads and mentors who guide us forward on ${formattedDate}.`;
  }
  if (lower.includes('halloween')) {
    return `Costumes, candy, and spooky fun — ${formattedDate} is the night to celebrate.`;
  }
  if (lower.includes('thanksgiving')) {
    return `Gather, give thanks, and share a meal with the people who matter on ${formattedDate}.`;
  }
  if (lower.includes('christmas')) {
    return `Warm wishes and joyful moments — celebrating the holiday season on ${formattedDate}.`;
  }
  if (lower.includes('independence') || lower.includes('fourth of july')) {
    return `Stars, stripes, and celebration — ${formattedDate} marks the nation\'s birthday.`;
  }
  if (lower.includes('earth')) {
    return `A reminder to care for the planet we all share, observed on ${formattedDate}.`;
  }

  return `Join the celebration and share the moment — ${formattedDate} is ${eventName} across the United States.`;
}

function formatDateForDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function buildDesignPrompt(
  eventName: string,
  dateStr: string,
  headline: string,
  tagline: string,
  supportingText: string,
  visualDirection: string
): string {
  const formattedDate = formatDateForDisplay(dateStr);

  return `Create ONE premium, sophisticated, U.S.-focused Twitter/X social media post
at exactly 1200 x 675 px for ${eventName} in the United States.

EVENT:
${eventName}

DATE:
${formattedDate}

HEADLINE:
${headline}

TAGLINE:
${tagline}

SUPPORTING TEXT:
${supportingText}

VISUAL DIRECTION:
${visualDirection}

Create a polished editorial composition.

Place the uploaded FreezeCrowd logo at the TOP-LEFT corner with comfortable,
balanced padding. The logo should be clearly visible but visually secondary
to the main event content.

Use the uploaded FreezeCrowd logo exactly as provided.
Do not modify, recreate, recolor, distort, crop, rotate, stretch,
redesign, or add effects to the logo. Do not add glow, shadow, or outline.
Preserve the original logo proportions exactly.

Place the main text content — headline, tagline, and supporting text —
in the LEFT/CENTER area. Use premium typography with strong hierarchy,
excellent readability, appropriate font weight, high contrast, and clean spacing.
Keep the text restrained and feed-friendly.

Place a strong, visually compelling event-specific hero artwork
in the RIGHT/CENTER area. The artwork must be directly relevant to ${eventName}
and follow the visual direction above. The artwork should not interfere
with text readability.

Use a premium, sophisticated, modern, professional, editorial-quality
visual style. The design should be clean, spacious, polished, and visually
balanced. It should look professionally art-directed, not like a generic
AI-generated social post.

The background and hero artwork must clearly relate to ${eventName}.
Do not use generic stock photography or unrelated backgrounds.
Do not use excessive icons, cards, UI elements, or decorative clutter.
Do not use dashboards, UI screenshots, random shapes, or unrelated imagery.
Do not use Indian-style visual treatment.

Do not add website URLs, footer text, bottom branding, company information,
additional logos, or promotional text. The FreezeCrowd logo at the top-left
is the only branding.

FINAL OUTPUT:
ONE single Twitter/X design.
Exactly 1200 x 675 px.
16:9 aspect ratio.
No collage.
No contact sheet.
No additional resolutions.
No alternate versions.
No multiple frames.
No LinkedIn format.
No other social media formats.`;
}

const FORBIDDEN_PATTERNS: RegExp[] = [
  /linkedin/i,
  /1584\s*[x×]\s*396/i,
  /1200\s*[x×]\s*627/i,
  /collage/i,
  /contact\s*sheet/i,
  /multiple\s*resolution/i,
  /multiple\s*frame/i,
  /alternate\s*version/i,
];

function validateDesignPrompt(prompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = prompt.match(pattern);
    if (match) {
      issues.push(`Forbidden content detected: "${match[0]}"`);
    }
  }

  if (!prompt.includes('1200') || !prompt.includes('675')) {
    issues.push('Missing required dimensions (1200 x 675 px)');
  }

  if (!/16:\s*9/.test(prompt) && !/16\s*[:x×]\s*9/.test(prompt)) {
    issues.push('Missing 16:9 aspect ratio');
  }

  if (!/twitter\/x/i.test(prompt) && !/twitter.*x/i.test(prompt) && !/x\s*social/i.test(prompt)) {
    issues.push('Missing Twitter/X format specification');
  }

  return { valid: issues.length === 0, issues };
}

export function generateFreezeCrowdPrompt(event: RankedEvent): SocialPost {
  const headline = generateHeadline(event.name);
  const tagline = generateTagline(event.name);
  const supportingText = generateSupportingText(event.name, event.date);
  const visualDirection = determineVisualDirection(event.name);
  const designPrompt = buildDesignPrompt(
    event.name,
    event.date,
    headline,
    tagline,
    supportingText,
    visualDirection
  );

  const validation = validateDesignPrompt(designPrompt);
  if (!validation.valid) {
    console.warn('[FreezeCrowd] Prompt validation issues:', validation.issues);
  }

  return {
    headline,
    tagline,
    supportingText,
    visualDirection,
    designPrompt,
  };
}

export { validateDesignPrompt };
