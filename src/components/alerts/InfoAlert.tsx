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
            variant="icon"
            onClick={() => Question()}
        >
            <QuestionIcon className="w-4 h-4" />
        </Button>
    )
}