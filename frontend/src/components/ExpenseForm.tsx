/**
 * Form component for adding/editing expenses
 */

import React from "react";
import { ExpenseFormData } from "../types";

// kept as fallback
import { EXPENSE_CATEGORIES } from "../constants/categories";

// utilize existing fetch function, created new createCategory
import { fetchCategories, createCategory } from "../services/api";

import { TextField, SelectBox, Button, Modal } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

type Option = {
  value: string;
  label: string;
};

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };


  // for category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);

  const handleAddCategory = async () => {
    setIsCreatingCategory(true);

    try {
      const newCategory = await createCategory(newCategoryName.trim());
      const updatedCategories = await fetchCategories();

      setCategoryOptions(updatedCategories.map((category) => ({
        value: category.name,
        label: category.name,
      })));

      handleChange("category", newCategory.name);

      setIsCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category. Please try again.");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  const fallbackCategories = React.useMemo(() => EXPENSE_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })), []);

  //create state for categories and fill with data
  const [categoryOptions, setCategoryOptions] = React.useState<Option[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const dateNow = new Date().toISOString().split("T")[0]

    //defaulting to current date
    if (!e.target.value) {
      handleChange("date", dateNow);
      return;
    }

    const selectedDate = new Date(e.target.value).toISOString().split("T")[0];

    if (selectedDate > dateNow) {
      window.alert(`Please select the date starting from today, ${dateNow} and moving backward for your required timeframe.`);
      return handleChange("date", dateNow)
    }

    return handleChange("date", selectedDate)
  }

  React.useEffect(() => {
    fetchCategories()
      .then((data) => {
        if (data.length > 0) {
          setCategoryOptions(data.map((category) => ({
            value: category.name,
            label: category.name
          })));
        } else {
          setCategoryOptions(fallbackCategories);
        }

      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategoryOptions(fallbackCategories);
      })
      .finally(() => {
        setIsLoadingCategories(false);
      });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          inputMode="decimal"
          min="0"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        {isLoadingCategories ? <p>Loading categories...</p> :
          <div>
            <div style={{ paddingBottom: ".5rem" }}>
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  // color: COLORS.text.primary,
                }}>Category: </label>
              <Button
                type="button"
                variant="primary"
                size="small"
                // disabled={isSubmitting}
                onClick={() => setIsCategoryModalOpen(true)}
              >+</Button>
            </div>
            <SelectBox
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              required
            />
          </div>
        }

        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          error={errors.date}
          fullWidth
          required
          max={new Date().toISOString().split("T")[0]}
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Custom Category"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TextField
            label="Category Name"
            type="text"
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            fullWidth
            required
          />

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!newCategoryName.trim() || isCreatingCategory}
              onClick={handleAddCategory}
            >
              {isCreatingCategory ? "Creating..." : "Add Category"}
            </Button>
          </div>
        </div>
      </Modal>

    </>
  );
}
