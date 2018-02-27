// 风级转换
export const getVelLevel = (vel) => {
    //             0   1   2   3   4   5    6    7    8    9    10   11   12   13   14   15   16   17   18   19
    var levels=[0.3,1.6,3.4,5.5,8.0,10.8,13.9,17.2,20.8,24.5,28.5,32.7,37.0,41.5,46.2,51.0,56.1,61.3,66.8,72.4];
    // let levels = [0.5,2.6,4.6,6.6,8.6,10.5,12.5,14.5,16.5,18.5,20.5,22.5,24.5,26.5,28.5,30.5,32.5,34.5,36.5,38.6];
    for (let i = 0; i < levels.length; i++){
        if (vel<levels[i])
            return i;
    }
    return 20;
}
// 风向转换
export const getDirLevel = (dir) => {
    let windDir = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
    //              1N    2EN   3E   4ES   5S   6WS   7W    8WN     1N
    let dirBound = [22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5];
    for (let i=0; i<dirBound.length-1; i++){
        if (dir>dirBound[i] && dir<=dirBound[i+1])
            return windDir[i+1];
    }
    return windDir[1];
}
