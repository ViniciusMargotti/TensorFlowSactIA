import React, {useState, useEffect, useRef} from 'react';
import * as mobilenet from "@tensorflow-models/mobilenet";

function App() {
    //Cria todos os estados da tela, estado == valores
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [model, setModel] = useState(null)
    const [imageURL, setImageURL] = useState(null);
    const [results, setResults] = useState([])
    const [history, setHistory] = useState([])

    //Cria as refs do react para utilizar nos input de imagem e textos;
    const imageRef = useRef()
    const textInputRef = useRef()
    const fileInputRef = useRef()

    //Ao iniciar o projeto essa função será chamada.
    useEffect(() => {
        carregarModeloTensorFlow()
    }, [])

    //Função responsável por carregar o modelo do tensor flow
    const carregarModeloTensorFlow = async () => {
        setIsModelLoading(true)
        try {
            //Carrega o modelo do tensor fllow da lib mobilenet
            const model = await mobilenet.load()
            //Seta o modelo carregado
            setModel(model)
            //Seta o estado para false, indicando que o modelo está carregado
            setIsModelLoading(false)
        } catch (error) {
            console.log(error)
            setIsModelLoading(false)
        }
    }

    //Função responsável por carregar a imagem
    const uploadImage = (e) => {
        const {files} = e.target
        if (files.length > 0) {
            const url = URL.createObjectURL(files[0])
            setImageURL(url)
        } else {
            setImageURL(null)
        }
    }

    //Função responsável por classificar a imagem
    const identify = async () => {
        textInputRef.current.value = ''
        // classifica a imagem e retorna os resultados que são apresentados na tela
        const results = await model.classify(imageRef.current)
        setResults(results)
    }

    //Função responsável por salvar o ul imagem
    const handleOnChange = (e) => {
        setImageURL(e.target.value)
        setResults([])
    }

    const triggerUpload = () => {
        fileInputRef.current.click()
    }

    //Ao clicar no botão de salvar, a imagem é salva no histórico
    useEffect(() => {
        if (imageURL) {
            setHistory([imageURL, ...history])
        }
    }, [imageURL])

    //Responsável por apresentar o carregamento inicial
    if (isModelLoading) {
        return <h2>Cerregando modelo TensorFlow.js...</h2>
    }

    return (
        <div className="App">
            <h1 className='header'>Classificador de imagens SATC</h1>
            <div className='inputHolder'>
                <span style={{marginRight: 10}}>Anexe suas imagens para classificá-las </span>
                <input type='file' accept='image/*' capture='camera' className='uploadInput' onChange={uploadImage}
                       ref={fileInputRef}/>
                <button className='uploadImage' onClick={triggerUpload}>Anexar imagem</button>
                <span style={{display: 'none'}} className='or'>OR</span>
                <input type="text" style={{display: 'none'}} placeholder='Paster image URL' ref={textInputRef}
                       onChange={handleOnChange}/>
            </div>
            <div className="mainWrapper">
                <div className="mainContent">
                    <div className="imageHolder">
                        {imageURL && <img src={imageURL} alt="Upload Preview" crossOrigin="anonymous" ref={imageRef}/>}
                    </div>
                    {results.length > 0 && <div className='resultsHolder'>
                        {results.map((result, index) => {
                            return (
                                <div className='result' key={result.className}>
                                    <span className='name'>{result.className}</span>
                                    <span
                                        className='confidence'>Nível de confiança: {(result.probability * 100).toFixed(2)}% {index === 0 &&
                                        <span className='bestGuess'>Melhor possibilidade</span>}</span>
                                </div>
                            )
                        })}
                    </div>}
                </div>
                {imageURL && <button className='button' onClick={identify}>Classificar imagem</button>}
            </div>
            {history.length > 0 && <div className="recentPredictions">
                <h2>Imagens recentes</h2>
                <div className="recentImages">
                    {history.map((image, index) => {
                        return (
                            <div className="recentPrediction" key={`${image}${index}`}>
                                <img src={image} alt='Recent Prediction' onClick={() => setImageURL(image)}/>
                            </div>
                        )
                    })}
                </div>
            </div>}
        </div>
    );
}

export default App;
