import { Modal, Select, Text, NumberInput, Button, Group } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { Teacher, CurrentRelation } from "./types";
import { getNumericRate } from "./utils";

interface EditRelationModalProps {
  opened: boolean;
  onClose: () => void;
  currentRelation: CurrentRelation | null;
  teachers: Teacher[];
  relationForm: UseFormReturnType<{
    teacherWorkloads: { teacherId: string; workload: number; rate?: number }[];
  }>;
  onSubmit: (values: {
    teacherWorkloads: { teacherId: string; workload: number; rate?: number }[];
  }) => Promise<void>;
  onAddTeacher: (teacherId: string) => void;
  onRemoveTeacher: (teacherId: string) => void;
  onUpdateWorkload: (teacherId: string, workload: number) => void;
  onUpdateRate: (teacherId: string, rate: number) => void;
}

export function EditRelationModal({
  opened,
  onClose,
  currentRelation,
  teachers,
  relationForm,
  onSubmit,
  onAddTeacher,
  onRemoveTeacher,
  onUpdateWorkload,
  onUpdateRate,
}: EditRelationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Add ${currentRelation?.type} Teachers`}
      size="lg"
    >
      <form onSubmit={relationForm.onSubmit(onSubmit)}>
        {/* Teacher Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Teachers
          </label>
          <Select
            placeholder="Choose a teacher to add"
            searchable
            data={teachers
              .filter(
                (teacher) =>
                  !relationForm.values.teacherWorkloads.find(
                    (tw) => tw.teacherId === teacher.id,
                  ),
              )
              .map((teacher) => ({
                value: teacher.id,
                label: `${teacher.lastname} ${teacher.firstname}`,
              }))}
            onChange={(value) => {
              if (value) {
                onAddTeacher(value);
              }
            }}
            value={null}
          />
        </div>

        {/* Selected Teachers with Individual Workloads and Rates */}
        {relationForm.values.teacherWorkloads.length > 0 && (
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Teachers, their Workloads and Hourly Rates
            </label>
            <div className="space-y-3">
              {relationForm.values.teacherWorkloads.map(
                (teacherWorkload, _index) => {
                  const teacher = teachers.find(
                    (t) => t.id === teacherWorkload.teacherId,
                  );
                  const teacherDefaultRate = getNumericRate(teacher?.rate);

                  return (
                    <div
                      key={teacherWorkload.teacherId}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex-1">
                        <Text size="sm" fw={500}>
                          {teacher?.lastname} {teacher?.firstname}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Default rate: {teacherDefaultRate}€/h
                        </Text>
                      </div>
                      <div className="w-32">
                        <label className="mb-1 block text-xs text-gray-600">
                          Hours
                        </label>
                        <NumberInput
                          placeholder="Hours"
                          min={1}
                          value={teacherWorkload.workload}
                          onChange={(value) => {
                            if (typeof value === "number") {
                              onUpdateWorkload(
                                teacherWorkload.teacherId,
                                value,
                              );
                            }
                          }}
                          size="sm"
                        />
                      </div>
                      <div className="w-32">
                        <label className="mb-1 block text-xs text-gray-600">
                          Rate (€/h)
                        </label>
                        <NumberInput
                          placeholder="Rate"
                          min={0}
                          step={0.01}
                          value={teacherWorkload.rate ?? teacherDefaultRate}
                          onChange={(value) => {
                            if (typeof value === "number") {
                              onUpdateRate(teacherWorkload.teacherId, value);
                            }
                          }}
                          size="sm"
                        />
                      </div>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        onClick={() =>
                          onRemoveTeacher(teacherWorkload.teacherId)
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {relationForm.values.teacherWorkloads.length === 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
            <Text size="sm" c="dimmed">
              No teachers selected. Please add teachers using the dropdown
              above.
            </Text>
          </div>
        )}

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={relationForm.values.teacherWorkloads.length === 0}
          >
            Add Teachers
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
