import { AlertaInfo } from './alerta';
import { QuestionIcon } from '../icons/icons';
import { Button } from '../html';

interface InfoAlertProps {
    title: string;
    text: string;
}

export default function InfoAlert({ title, text }: InfoAlertProps) {

    const Question = async () => {
        await AlertaInfo(title, text);
    }

    return (
        <Button
            type="button"
            variant="custom"
            onClick={() => Question()}
            className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
            <QuestionIcon className="w-4 h-4" />
        </Button>
    )
}