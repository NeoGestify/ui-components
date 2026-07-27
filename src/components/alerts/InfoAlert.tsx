import { AlertaInfo } from './alerta';
// `text` se renombra: el componente ya tiene una prop con ese nombre.
import { bgHover, text as textCls, textHover } from '../../theme/tokens';
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
            className={`p-1 ${textCls.faint} ${textHover.accent} transition-colors rounded-full ${bgHover.surface}`}
        >
            <QuestionIcon className="w-4 h-4" />
        </Button>
    )
}