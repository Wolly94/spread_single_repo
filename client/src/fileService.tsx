import { Box } from '@material-ui/core'
import React, { useRef } from 'react'
import MyButton from './components/MyButton'

interface ReadFileProps {
    handleInput: (data: string, fileName: string) => void
    allowedFileEndings: string[]
    children: string
}

export const ReadFile: React.FC<ReadFileProps> = (props) => {
    const inputFileRef = useRef<HTMLInputElement | null>(null)
    const handleBtnClick = () => {
        if (inputFileRef.current != null) inputFileRef.current.click()
    }
    const onSelectFile = () => {
        if (inputFileRef.current == null) return
        var files = inputFileRef.current.files
        if (files === null || files.length === 0) return
        const file = files[0]
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = function (evt) {
            if (evt.target == null) return
            if (evt.target.result == null) return
            const data = evt.target.result
            props.handleInput(data.toString(), file.name)
        }
        inputFileRef.current.value = ''
    }
    return (
        <Box>
            <input
                hidden
                id="theFile"
                type="file"
                ref={inputFileRef}
                onChange={onSelectFile}
            />
            <MyButton onClick={handleBtnClick}>{props.children}</MyButton>
        </Box>
    )
}

interface SaveFileProps {
    fileName: string
    data: string
}

export const saveFile = (props: SaveFileProps) => {
    const textToBLOB = new Blob([props.data], { type: 'text/plain' })
    let link = document.createElement('a')
    link.download = props.fileName
    const href = window.URL.createObjectURL(textToBLOB)
    link.href = href
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
}
