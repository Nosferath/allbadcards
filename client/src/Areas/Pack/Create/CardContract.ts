export interface IEditableCard
{
	index: number;
	focus: boolean;
	value: string;
	canEdit: boolean;
	onEdit: (index: number, value: string) => void;
	onRemove: (index: number) => void;
	updateErrorState: (index: number, hasError: boolean) => void;
}