export interface IEditableCard
{
	index: number;
	focus: boolean;
	value: string;
	canEdit: boolean;
	onEdit: (index: number, value: string) => void;
	onRemove: (value: string) => void;
}