import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type SmallAssetCountCardProps = {
  title: string;
  total: number;
  accentColor: string;
  icon: React.ComponentType<{ color?: string; size?: number | string }>;
};

export function SmallAssetCountCard({
  title,
  total,
  accentColor,
  icon,
}: SmallAssetCountCardProps) {
  return (
    <Card className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border p-0">
      <Box className="px-3 py-3" style={{ backgroundColor: `${accentColor}14` }}>
        <HStack className="items-start justify-between gap-2">
          <VStack className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </Text>
            <Text className="text-2xl font-bold leading-7 text-foreground">{total}</Text>
          </VStack>
          <Box
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}22` }}>
            <Icon as={icon} color={accentColor} size="sm" />
          </Box>
        </HStack>
      </Box>
    </Card>
  );
}

export type CountCardDefinition = {
  title: string;
  accentColor: string;
  icon: React.ComponentType<{ color?: string; size?: number | string }>;
  match: (asset: Record<string, string>) => boolean;
};

export function SmallAssetCountCardRow({
  assets,
  cards,
}: {
  assets: Record<string, string>[];
  cards: CountCardDefinition[];
}) {
  return (
    <HStack className="gap-3">
      {cards.map((card) => (
        <SmallAssetCountCard
          key={card.title}
          title={card.title}
          total={assets.filter(card.match).length}
          accentColor={card.accentColor}
          icon={card.icon}
        />
      ))}
    </HStack>
  );
}
