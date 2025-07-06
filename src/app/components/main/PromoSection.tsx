"use client";

import { Paper, Title, Badge, Table, Text, Group, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import type { CartesianData } from "./types";
import { getTeacherNames, getTruncatedTeacherNames } from "./utils";

interface PromoSectionProps {
  promoName: string;
  items: CartesianData[];
  isExpanded: boolean;
  onToggleExpansion: (promoName: string) => void;
  onOpenRelationModal: (
    type: "ongoing" | "potential" | "selected",
    promoModuleId: string,
    moduleWorkload: number,
  ) => void;
  onOpenPotentialTeachersModal: (
    teachers: Array<{
      teacher: { id: string; lastname: string; firstname: string };
    }>,
  ) => void;
}

export function PromoSection({
  promoName,
  items,
  isExpanded,
  onToggleExpansion,
  onOpenRelationModal,
  onOpenPotentialTeachersModal,
}: PromoSectionProps) {
  const router = useRouter();

  return (
    <Paper shadow="sm" p="md">
      <div
        className="mb-4 flex cursor-pointer items-center justify-between border-b pb-2"
        onClick={() => onToggleExpansion(promoName)}
      >
        <Title order={3} className="text-blue-800">
          {promoName}
        </Title>
        <div className="flex items-center gap-2">
          <Badge color="gray" size="sm">
            {items.length} module{items.length > 1 ? "s" : ""}
          </Badge>
          <svg
            className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Module</Table.Th>
                <Table.Th>Workload</Table.Th>
                <Table.Th>Ongoing Teachers</Table.Th>
                <Table.Th>Potential Teachers</Table.Th>
                <Table.Th>Selected Teachers</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.promoModule.id}>
                  <Table.Td>
                    <button
                      onClick={() => {
                        router.push(
                          `/modules/details?promoId=${item.promoModule.promo.id}&moduleId=${item.promoModule.id}`,
                        );
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-left font-medium transition-colors hover:text-blue-600 hover:underline"
                    >
                      🔍 {item.promoModule.module.name}
                    </button>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue">{item.promoModule.workload}h</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {item.ongoing.length > 0
                        ? getTeacherNames(item.ongoing)
                        : "None"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {item.potential.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Text size="sm">
                          {getTruncatedTeacherNames(item.potential)}
                        </Text>
                        {getTeacherNames(item.potential).length > 30 && (
                          <button
                            onClick={() =>
                              onOpenPotentialTeachersModal(item.potential)
                            }
                            className="cursor-pointer border-none bg-transparent p-1 text-blue-600 hover:text-blue-800"
                            title="Voir tous les intervenants potentiels"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <Text size="sm">None</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {item.selected.length > 0
                        ? getTeacherNames(item.selected)
                        : "None"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        onClick={() =>
                          onOpenRelationModal(
                            "ongoing",
                            item.promoModule.id,
                            item.promoModule.workload,
                          )
                        }
                      >
                        + Ongoing
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="orange"
                        onClick={() =>
                          onOpenRelationModal(
                            "potential",
                            item.promoModule.id,
                            item.promoModule.workload,
                          )
                        }
                      >
                        + Potential
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        onClick={() =>
                          onOpenRelationModal(
                            "selected",
                            item.promoModule.id,
                            item.promoModule.workload,
                          )
                        }
                      >
                        + Selected
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Paper>
  );
}
