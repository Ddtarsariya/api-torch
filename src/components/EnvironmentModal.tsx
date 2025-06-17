import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import type { Environment, KeyValuePair } from "../types";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { KeyValueEditor } from "./request/KeyValueEditor";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environmentId?: string;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  environmentId,
}) => {
  const {
    getEnvironments,
    updateEnvironment,
    createEnvironment,
    deleteEnvironment,
  } = useAppStore();

  const environments = getEnvironments();
  const environment = environmentId
    ? environments.find((e) => e.id === environmentId)
    : null;

  const [name, setName] = useState(environment?.name || "");
  const [variables, setVariables] = useState<KeyValuePair[]>(
    environment?.variables || [],
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (environment) {
      setName(environment.name);
      setVariables(environment.variables);
    } else {
      setName("");
      setVariables([]);
    }
  }, [environment, isOpen]);

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      { id: uuidv4(), key: "", value: "", enabled: true },
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (environment) {
      updateEnvironment(environment.id, { name, variables });
    } else {
      // Use the enhanced createEnvironment function with variables
      createEnvironment(name, variables);
    }

    onClose();
  };

  const handleDelete = () => {
    if (environment) {
      deleteEnvironment(environment.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {environment ? "Edit" : "New"} Environment
            </DialogTitle>
            <DialogDescription>
              Environments allow you to store and reuse variables across
              requests.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="env-name">Environment Name</Label>
              <Input
                id="env-name"
                value={name}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setName(e.target.value)}
                placeholder="My Environment"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variables</Label>
                <Button variant="outline" size="sm" onClick={handleAddVariable}>
                  <Plus size={16} className="mr-1" /> Add Variable
                </Button>
              </div>

              <KeyValueEditor
                items={variables}
                onChange={setVariables}
                placeholders={{ key: "Variable name", value: "Value" }}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div>
              {environment && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                >
                  Delete Environment
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim()}>
                Save Environment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the environment "
              {environment?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
