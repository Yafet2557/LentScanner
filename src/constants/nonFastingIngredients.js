export const categories = {
  meat: 'meat',
  dairy: 'dairy',
  eggs: 'eggs',
  fish: 'fish',
  otherAnimal: 'otherAnimal',
  ambiguous: 'ambiguous',
};

const meat = [
  'beef', 'chicken', 'pork', 'lamb', 'turkey', 'veal', 'bacon', 'sausage',
  'pepperoni', 'salami', 'prosciutto', 'ham', 'venison', 'bison', 'duck',
  'goose', 'rabbit', 'meat', 'poultry', 'steak', 'ground beef',
  'ground turkey', 'ground pork', 'hot dog', 'jerky', 'deli meat',
  'chorizo', 'bratwurst', 'pastrami', 'corned beef',
];

const dairy = [
  'milk', 'cheese', 'butter', 'cream', 'whey', 'casein', 'caseinate',
  'lactose', 'yogurt', 'yoghurt', 'ghee', 'curds', 'sour cream',
  'cream cheese', 'cottage cheese', 'ricotta', 'mozzarella', 'parmesan',
  'cheddar', 'gouda', 'brie', 'buttermilk', 'half and half', 'heavy cream',
  'whipping cream', 'condensed milk', 'evaporated milk', 'milk powder',
  'skim milk', 'whole milk', 'milk solids', 'milk protein', 'lactalbumin',
  'lactoglobulin',
];

const eggs = [
  'egg', 'eggs', 'egg white', 'egg yolk', 'albumin', 'ovum', 'ovalbumin',
  'lysozyme', 'meringue', 'mayonnaise', 'mayo', 'egg powder', 'dried egg',
  'egg solids',
];

const fish = [
  'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'haddock',
  'sardine', 'sardines', 'anchovy', 'anchovies', 'herring', 'mackerel',
  'trout', 'bass', 'catfish', 'swordfish', 'shrimp', 'prawn', 'prawns',
  'crab', 'lobster', 'oyster', 'oysters', 'clam', 'clams', 'mussel',
  'mussels', 'scallop', 'scallops', 'squid', 'calamari', 'octopus',
  'caviar', 'fish sauce', 'fish oil', 'omega-3 fish', 'surimi',
  'imitation crab',
];

const otherAnimal = [
  'gelatin', 'gelatine', 'honey', 'lard', 'tallow', 'suet', 'beeswax',
  'carmine', 'cochineal', 'shellac', 'lanolin', 'collagen', 'bone char',
  'bone broth', 'animal fat', 'animal shortening', 'rennet', 'isinglass',
  'pepsin', 'vitamin d3',
];

export const ambiguousKeywords = [
  'natural flavors', 'natural flavor', 'natural flavoring',
  'natural flavouring', 'mono and diglycerides', 'monoglycerides',
  'diglycerides', 'enzyme', 'enzymes', 'lecithin', 'stearic acid',
  'glycerin', 'glycerine', 'glycerol', 'l-cysteine',
  "confectioner's glaze", 'magnesium stearate',
];

// Build a single map: keyword -> category
const buildMap = () => {
  const map = {};
  const addAll = (list, cat) => list.forEach((k) => { map[k] = cat; });
  addAll(meat, categories.meat);
  addAll(dairy, categories.dairy);
  addAll(eggs, categories.eggs);
  addAll(fish, categories.fish);
  addAll(otherAnimal, categories.otherAnimal);
  return map;
};

export const allNonFasting = buildMap();
